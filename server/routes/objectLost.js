//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { ObjectLost } = require('../models/objectLost');
const multer = require('multer');
const fs = require('fs');
const coolsms = require('coolsms-node-sdk').default

const mongoose = require('mongoose');
const User = mongoose.models.User || require('../models/user');
//한 페이지당 보여줄 게시글 수
const show_list = 10;

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../images/object_lost')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//SMS 알리기 API
const messageService = new coolsms(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);

//해당하는글 들어가기
/**
 * @swagger
 * /api/object/lost/detail/{id}:
 *   get:
 *     summary: 분실물 상세 정보 조회
 *     tags: [ObjectLost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글의 MongoDB ObjectId
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 현재 페이지 번호 (선택)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (선택)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 작성일 시작 범위 (선택)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 작성일 종료 범위 (선택)
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실일 시작 범위 (선택)
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실일 종료 범위 (선택)
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시/도 (선택)
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시군구 (선택)
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍면동 (선택)
 *     responses:
 *       200:
 *         description: 게시글 및 쿼리 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   description: 분실물 게시글 데이터
 *                 query:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: string
 *                     search:
 *                       type: string
 *                     dateStart:
 *                       type: string
 *                     dateEnd:
 *                       type: string
 *                     lstYmdStart:
 *                       type: string
 *                     lstYmdEnd:
 *                       type: string
 *                     si:
 *                       type: string
 *                     sgg:
 *                       type: string
 *                     emd:
 *                       type: string
 *       404:
 *         description: 게시글이 존재하지 않음
 *       500:
 *         description: 서버 오류
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await ObjectLost.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");

        const obj = post.toObject();

        // 현재 검색 조건 및 페이지 정보를 그대로 전달
        const queryInfo = {
            page: req.query.page || '1',
            search: req.query.search || '',
            dateStart: req.query.dateStart || '',
            dateEnd: req.query.dateEnd || '',
            lstYmdStart: req.query.lstYmdStart || '',
            lstYmdEnd: req.query.lstYmdEnd || '',
            si: req.query.si || '',
            sgg: req.query.sgg || '',
            emd: req.query.emd || ''
        };

        res.json({
            post: obj,
            query: queryInfo
        });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

//글 작성하기
/**
 * @swagger
 * /api/object/lost/write:
 *   post:
 *     summary: 분실물 게시글 작성
 *     tags: [ObjectLost]
 *     security:
 *       - cookieAuth: []  # 세션 쿠키 인증
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lstPrdtNm
 *               - lstYmd
 *               - lstPlace
 *             properties:
 *               lstPrdtNm:
 *                 type: string
 *                 description: 물품명
 *               lstYmd:
 *                 type: string
 *                 format: date
 *                 description: 분실 날짜
 *               lstHor:
 *                 type: string
 *                 description: 분실 시간 
 *               lstPlace:
 *                 type: string
 *                 description: 분실 장소
 *               si:
 *                 type: string
 *                 description: 시/도 
 *               sgg:
 *                 type: string
 *                 description: 시군구
 *               emd:
 *                 type: string
 *                 description: 읍면동
 *               prdtClNm:
 *                 type: string
 *                 description: 분류명 
 *               uniq:
 *                 type: string
 *                 description: 특이사항
 *               lstLctNm:
 *                 type: string
 *                 description: 상세 지역명
 *               lstSbjt:
 *                 type: string
 *                 description: 게시글 제목
 *               lstFilePathImg:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       201:
 *         description: 글이 성공적으로 등록됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       400:
 *         description: 필수 항목 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: 인증되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/write', upload.single('lstFilePathImg'), async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const {
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            si,
            sgg,
            emd,
            prdtClNm,
            uniq,
            lstLctNm,
            lstSbjt
        } = req.body;

        // 필수 항목 체크
        if (!lstPrdtNm || !lstYmd || !lstPlace || !si || !sgg || !emd) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }

        const lstFilePathImg = req.file
            ? `${req.protocol}://${req.get('host')}/api/images/object_lost/${req.file.filename}`
            : null;

        const newPost = new ObjectLost({
            user_id: req.user._id,
            date: new Date(),
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            si,
            sgg,
            emd,
            prdtClNm,
            uniq,
            lstLctNm,
            lstSbjt,
            lstFilePathImg,
            tel: req.user.phone_number
        });

        const saved = await newPost.save();

        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        console.error("Error writing lost post:", err.message);
        res.status(500).json({ error: "Server Error" });  // JSON 응답으로 수정
    }
});

// 검색기능 및 목록
/**
 * @swagger
 * /api/object/lost/search:
 *   get:
 *     summary: 분실물 게시글 검색 및 목록 조회
 *     tags: [ObjectLost]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (물품명, 장소, 제목 등)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 시작 날짜
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 종료 날짜
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 시작 일자
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 종료 일자
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *           example: 서울특별시
 *         description: 시/도
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *           example: 강남구
 *         description: 시군구
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *           example: 역삼동
 *         description: 읍면동
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 요청할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 게시글 목록과 페이지 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                   description: 전체 페이지 수 (10 기준으로 나눈 값)
 *                 results:
 *                   type: array
 *                   description: 게시글 목록 (페이지당 최대 10개)
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6650d376e8237b07dcd5461b"
 *                       lstPrdtNm:
 *                         type: string
 *                         example: 지갑
 *                       lstPlace:
 *                         type: string
 *                         example: 서울역 2층 대합실
 *                       prdtClNm:
 *                         type: string
 *                         example: 전자기기
 *                       lstSteNm:
 *                         type: string
 *                         example: 보관 중
 *                       lstLctNm:
 *                         type: string
 *                         example: 서울특별시
 *                       lstSbjt:
 *                         type: string
 *                         example: 지갑을 찾습니다
 *                       date:
 *                         type: string
 *                         example: "2025-05-16"
 *                       lstFilePathImg:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       500:
 *         description: 서버 오류
 */
router.get('/search', async (req, res) => {
    const {
        search,
        dateStart,
        dateEnd,
        lstYmdStart,
        lstYmdEnd,
        si,
        sgg,
        emd,
        page = 1,
    } = req.query;

    const andConditions = [];

    // 통합 텍스트 검색 (OR)
    if (search) {
        const words = search.trim().split(/\s+/);
        const orGroup = [];

        for (const word of words) {
            const regex = { $regex: word, $options: 'i' };
            orGroup.push({
                $or: [
                    { lstPrdtNm: regex },
                    { lstPlace: regex },
                    { prdtClNm: regex },
                    { uniq: regex },
                    { lstSbjt: regex },
                    { lstPlaceSeNm: regex }
                ]
            });
        }

        andConditions.push(...orGroup); // 모든 단어가 적어도 한 필드에 포함되어야 함
    }

    // 날짜 범위 (OR)
    const dateOrConditions = [];

    if (dateStart || dateEnd) {
        const range = {};
        if (dateStart) range.$gte = new Date(dateStart);
        if (dateEnd) range.$lte = new Date(new Date(dateEnd).setHours(23, 59, 59, 999));
        dateOrConditions.push({ date: range });
    }

    if (lstYmdStart || lstYmdEnd) {
        const range = {};
        if (lstYmdStart) range.$gte = new Date(lstYmdStart);
        if (lstYmdEnd) range.$lte = new Date(new Date(lstYmdEnd).setHours(23, 59, 59, 999));
        dateOrConditions.push({ lstYmd: range });
    }

    if (dateOrConditions.length > 0) {
        andConditions.push({ $or: dateOrConditions });
    }

    // si / sgg / emd는 개별 검색 (정확 일치)
    if (si) andConditions.push({ si: { $regex: si, $options: 'i' } });
    if (sgg) andConditions.push({ sgg: { $regex: sgg, $options: 'i' } });
    if (emd) andConditions.push({ emd: { $regex: emd, $options: 'i' } });

    const finalQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    try {
        const skip = (parseInt(page) - 1) * parseInt(show_list);
        const limit = parseInt(show_list);

        const docs = await ObjectLost.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await ObjectLost.countDocuments(finalQuery);

        const results = docs.map(doc => {
            const obj = doc.toObject();
            obj.date = obj.date ? new Date(obj.date).toISOString().slice(0, 10) : null;
            return obj;
        });

        res.json({
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(show_list)),
            totalCount,
            results
        });
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});

/**
 * @swagger
* /api/object/lost/notify/{id}:
 *   post:
 *     summary: 게시글 작성자에게 로그인한 사용자의 연락처 전송
 *     description: 게시글 상세 페이지에서 '알리기' 버튼 클릭 시, 해당 게시글 작성자에게 로그인한 사용자의 전화번호를 SMS로 전송합니다.
 *     tags:
 *       - ObjectLost
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 알리기를 수행할 게시글의 MongoDB ObjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SMS가 성공적으로 전송된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 작성자에게 알림이 전송되었습니다.
 *                 result:
 *                   type: object
 *                   description: Coolsms API의 응답 객체
 *       401:
 *         description: 로그인되지 않은 사용자가 접근한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 로그인이 필요합니다.
 *       404:
 *         description: 게시글 또는 사용자 정보를 찾을 수 없는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 문자 전송 중 오류가 발생했습니다.
 */
// routes/objectLost.js 내부에 추가
router.post('/notify/:id', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const post = await ObjectLost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

        const writer = await User.findById(post.user_id);
        const sender = await User.findById(req.user._id);

        if (!writer || !writer.phone_number) {
            return res.status(404).json({ error: '작성자 정보를 찾을 수 없습니다.' });
        }

        if (!sender || !sender.phone_number) {
            return res.status(400).json({ error: '전화번호가 등록되지 않은 사용자입니다.' });
        }

        const message = {
            to: writer.phone_number,
            from: process.env.SMS_FROM,
            text: `[알림] ${sender.name}님이 본인의 연락처(${sender.phone_number})를 공유했습니다.`,
        };

        const response = await messageService.sendOne(message); // 실제 coolsms SDK 사용법에 따라 수정 필요

        res.json({ message: '작성자에게 알림이 전송되었습니다.', result: response });
    } catch (error) {
        console.error('SMS 전송 오류:', error);
        res.status(500).json({ error: '문자 전송 중 오류가 발생했습니다.' });
    }
});

module.exports = router
