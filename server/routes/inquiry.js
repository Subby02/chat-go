const express = require('express');
const router = express.Router();
const { Inquiry } = require('../models/inquiry');

// 1:1 문의 등록
router.post('/write', async (req, res) => {
  try {
    const { user_id, title, content } = req.body;

    if (!user_id || !title || !content) {
      return res.status(400).json({ message: '모든 항목은 필수입니다.' });
    }

    const newInquiry = new Inquiry({ user_id, title, content });
    await newInquiry.save();

    res.status(201).json({
      message: '문의가 등록되었습니다.',
      data: newInquiry
    });
  } catch (error) {
    res.status(500).json({ message: '등록 실패', error: error.message });
  }
});

// 문의 목록 조회 (페이지)
router.get('/list/:num', async (req, res) => {
    const page = parseInt(req.params.num) || 1;
    const perPage = 10;
  
    try {
      const total = await Inquiry.countDocuments();
      const data = await Inquiry.find()
        .sort({ date: -1 }) // 최신순
        .skip((page - 1) * perPage)
        .limit(perPage);
  
      res.status(200).json({
        total,
        page,
        perPage,
        data
      });
    } catch (error) {
      res.status(500).json({ message: '목록 조회 오류', error: error.message });
    }
});

// 문의 상세 조회
router.get('/detail/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const inquiry = await Inquiry.findById(id);
  
      if (!inquiry) {
        return res.status(404).json({ message: '해당 문의를 찾을 수 없습니다.' });
      }
  
      res.status(200).json(inquiry);
    } catch (error) {
      res.status(400).json({ message: '조회 중 오류 발생', error: error.message });
    }
});
  
// 관리자 답변 등록
router.put('/answer/write/:id', async (req, res) => {
    const id = req.params.id;
    const { answer } = req.body;
  
    if (!answer) {
      return res.status(400).json({ message: '답변 내용은 필수입니다.' });
    }
  
    try {
      const updated = await Inquiry.findByIdAndUpdate(
        id,
        {
          $set: {
            answer,
            answerDate: new Date(),
            status: '답변완료'
          }
        },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: '문의글을 찾을 수 없습니다.' });
      }
  
      res.status(200).json({
        message: '답변이 등록되었습니다.',
        data: updated
      });
    } catch (error) {
      res.status(400).json({ message: '답변 등록 중 오류', error: error.message });
    }
});

router.put('/answer/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { answer } = req.body;
  
    if (!answer) {
      return res.status(400).json({ message: '수정할 답변 내용이 필요합니다.' });
    }
  
    try {
      const updated = await Inquiry.findByIdAndUpdate(
        id,
        {
          $set: {
            answer,
            answerDate: new Date(), // 수정 시에도 갱신
          }
        },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: '문의글을 찾을 수 없습니다.' });
      }
  
      res.status(200).json({ message: '답변이 수정되었습니다.', data: updated });
    } catch (error) {
      res.status(400).json({ message: '수정 중 오류 발생', error: error.message });
    }
});

router.put('/answer/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const cleared = await Inquiry.findByIdAndUpdate(
        id,
        {
          $set: {
            answer: '',
            answerDate: null,
            status: '답변대기'
          }
        },
        { new: true }
      );
  
      if (!cleared) {
        return res.status(404).json({ message: '문의글을 찾을 수 없습니다.' });
      }
  
      res.status(200).json({ message: '답변이 삭제되었습니다.', data: cleared });
    } catch (error) {
      res.status(400).json({ message: '삭제 중 오류 발생', error: error.message });
    }
});    

module.exports = router;