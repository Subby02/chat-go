const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { AnimalGet } = require('../models/AnimalGet');

// 보호 동물 글 등록
router.post('/get/write', async (req, res) => {
  try {
    const newAnimal = new AnimalGet(req.body);
    await newAnimal.save();
    res.status(201).json({
      message: '보호 동물 등록 완료',
      data: newAnimal
    });
  } catch (error) {
    res.status(400).json({
      message: '등록 실패',
      error: error.message
    });
  }
});

// 목록 조회 (페이지 포함)
router.get('/get/list/:num', async (req, res) => {
    const page = parseInt(req.params.num) || 1; // 몇 번째 페이지인지
    const perPage = 10; // 한 페이지에 보여줄 게시물 수

    try {
        const total = await AnimalGet.countDocuments(); // 전체 게시물 수
        const data = await AnimalGet.find()
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
        res.status(500).json({ message: '조회 중 오류 발생', error: error.message });
    }
});

// 보호 중 글 상세조회
router.get('/get/detail/:id', async (req, res) => {
    const id = req.params.id;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }
  
    try {
      const animal = await AnimalGet.findById(id);
  
      if (!animal) {
        return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
      }
  
      res.status(200).json(animal);
    } catch (error) {
      res.status(500).json({ message: '조회 중 오류 발생', error: error.message });
    }
});


// 보호 중 글 수정
router.put('/get/edit/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
  
    try {
      const updatedAnimal = await AnimalGet.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true } // 수정된 결과를 반환
      );
  
      if (!updatedAnimal) {
        return res.status(404).json({ message: '수정할 게시글이 존재하지 않습니다.' });
      }
  
      res.status(200).json({
        message: '수정이 완료되었습니다.',
        data: updatedAnimal
      });
    } catch (error) {
      res.status(400).json({
        message: '수정 중 오류가 발생했습니다.',
        error: error.message
      });
    }
});

module.exports = router;