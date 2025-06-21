const router = require('express').Router();
const { Inquiry } = require('../models/inquiry');
const { User } = require('../models/user');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * tags:
 *   name: Inquiry
 *   description: 1:1 문의 관련 API
 */

// 관리자 체크 미들웨어
const isAdmin = (req, res, next) => {
  console.log("user in Admin", req.user);
  if (!req.isAuthenticated() || req.user.role !== 1) {
    return res.status(403).json({ error: '관리자만 접근 가능합니다.' });
  }
  next();
};

/**
 * @swagger
 * /api/inquiry/list:
 *   get:
 *     summary: 전체 문의글 목록 조회 (타이틀만)
 *     tags: [Inquiry]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 전체 문의글 목록 반환 (페이지네이션 포함)
 */
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const show_list = 10;
    const skip = (page - 1) * show_list;

    const totalCount = await Inquiry.countDocuments();
    const list = await Inquiry.find().sort({ date: -1 }).skip(skip).limit(show_list);

    const results = await Promise.all(list.map(async item => {
      let writerName = '비공개';
      if (item.isPublic) {
        const user = await User.findById(item.user_id);
        writerName = user ? user.name : '알 수 없음';
      }
      return {
        _id: item._id,
        title: item.title,
        writer: writerName,
        date: item.date,
        status: item.answer ? '답변완료' : '답변대기',
      };
    }));

    res.json({
      page,
      totalPages: Math.ceil(totalCount / show_list),
      totalCount,
      results
    });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/detail/{id}:
 *   get:
 *     summary: 문의 상세 조회
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 문의글 ID
 *     responses:
 *       200:
 *         description: 상세 문의 반환
 *       403:
 *         description: 비공개 접근 제한
 */
router.get('/detail/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ error: '문의글이 존재하지 않습니다.' });

    if (!inquiry.isPublic && req.user.role != 1 && (!req.isAuthenticated() || req.user._id.toString() !== inquiry.user_id)) {
      return res.status(403).json({ error: '비공개 글은 작성자만 조회할 수 있습니다.' });
    }

    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/search:
 *   get:
 *     summary: 문의 검색
 *     tags: [Inquiry]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, content, writer, tc]
 *         description: 검색 조건 (title, content, writer, tc)
 *     responses:
 *       200:
 *         description: 검색 결과 반환
 */
router.get('/search', async (req, res) => {
  try {
    const { q: keyword, type = 'tc' } = req.query; // tc = title + contnet
    if (!keyword) return res.status(400).json({ error: '검색어를 입력해주세요.' });

    const regex = { $regex: keyword, $options: 'i' };
    let searchCondition = {};

    if (type === 'writer') {
      const users = await User.find({ name: regex });
      const userIds = users.map(user => user._id.toString());
      searchCondition = { user_id: { $in: userIds } };
    } else if (type === 'title') {
      searchCondition = { title: regex };
    } else if (type === 'content') {
      searchCondition = { content: regex };
    } else {
      searchCondition = {
        $or: [
          { title: regex },
          { content: regex }
        ]
      };
    }

    const visibilityCondition = req.isAuthenticated()
      ? { $or: [{ isPublic: true }, { user_id: req.user._id.toString() }] }
      : { isPublic: true };

    const condition = {
      $and: [searchCondition, visibilityCondition]
    };

    const results = await Inquiry.find(condition).sort({ date: -1 });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/write:
 *   post:
 *     summary: 문의 작성
 *     tags: [Inquiry]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 문의 등록 성공
 */
router.post('/write', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: '로그인이 필요합니다.' });

  const { title, content, isPublic } = req.body;
  if (!title || !content) return res.status(400).json({ error: '제목과 내용은 필수입니다.' });

  try {
    const user = await User.findById(req.user._id);
    const inquiry = new Inquiry({
      user_id: req.user._id.toString(),
      writer: user.name,
      title,
      content,
      isPublic: isPublic !== false,
    });

    await inquiry.save();
    res.status(201).json({ message: '문의가 등록되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/{id}/answer:
 *   post:
 *     summary: 관리자 답변 등록
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: 답변 등록 성공
 */
router.post('/:id/answer', isAdmin, async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: '답변 내용을 입력해주세요.' });

  try {
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { answer, answerDate: new Date(), status: '답변완료' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: '문의글이 존재하지 않습니다.' });
    res.json({ message: '답변 등록 완료', inquiry: updated });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/{id}/answer:
 *   put:
 *     summary: 관리자 답변 수정
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: 답변 수정 완료
 */
router.put('/:id/answer', isAdmin, async (req, res) => {
  const { answer } = req.body;
  try {
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { answer, answerDate: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: '문의글이 존재하지 않습니다.' });
    res.json({ message: '답변 수정 완료', inquiry: updated });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * @swagger
 * /api/inquiry/{id}/answer:
 *   delete:
 *     summary: 관리자 답변 삭제
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 답변 삭제 완료
 */
router.delete('/:id/answer', isAdmin, async (req, res) => {
  try {
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { answer: '', answerDate: null, status: '답변대기' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: '문의글이 존재하지 않습니다.' });
    res.json({ message: '답변 삭제 완료', inquiry: updated });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;