const express = require('express');
const router = express.Router();
const { Faq } = require('../models/Faq');

// FAQ 등록
router.post('/write', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
  }

  try {
    const newFaq = new Faq({ title, content });
    await newFaq.save();

    res.status(201).json({ message: 'FAQ가 등록되었습니다.', data: newFaq });
  } catch (error) {
    res.status(500).json({ message: '등록 실패', error: error.message });
  }
});

// FAQ 목록 조회 (페이지네이션)
router.get('/list/:num', async (req, res) => {
    const page = parseInt(req.params.num) || 1;
    const perPage = 10;
  
    try {
      const total = await Faq.countDocuments();
      const data = await Faq.find()
        .sort({ date: -1 }) // 최신순 정렬
        .skip((page - 1) * perPage)
        .limit(perPage);
  
      res.status(200).json({
        total,
        page,
        perPage,
        data
      });
    } catch (error) {
      res.status(500).json({ message: 'FAQ 목록 조회 오류', error: error.message });
    }
});

// FAQ 상세 조회
router.get('/detail/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const faq = await Faq.findById(id);
  
      if (!faq) {
        return res.status(404).json({ message: 'FAQ를 찾을 수 없습니다.' });
      }
  
      res.status(200).json(faq);
    } catch (error) {
      res.status(400).json({ message: 'FAQ 조회 중 오류 발생', error: error.message });
    }
});  

// FAQ 수정
router.put('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
    }
  
    try {
      const updated = await Faq.findByIdAndUpdate(
        id,
        {
          $set: {
            title,
            content,
            date: new Date() // 수정 시 시간도 갱신
          }
        },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: 'FAQ를 찾을 수 없습니다.' });
      }
  
      res.status(200).json({
        message: 'FAQ가 수정되었습니다.',
        data: updated
      });
    } catch (error) {
      res.status(400).json({ message: 'FAQ 수정 중 오류 발생', error: error.message });
    }
  });
  
module.exports = router;
