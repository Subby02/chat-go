//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { Object_get } = require('../models/object_get.js');

//한 페이지당 보여줄 게시글 수
const show_list = process.env.SHOW_LIST

//object 내용
//글 목록 보여주기
// 글 목록 JSON 데이터 응답, 데이터베이스를 사용하기 떄문에 /api사용
//// 제보 목록 API
router.get('/api/object/get/list/:num', async (req, res) => {
    try {
        const page = parseInt(req.params.num) || 1;
        const limit = parseInt(process.env.SHOW_LIST) || 10;
        const skip = (page - 1) * limit;

        const result = await Object_get.find({})
            .skip(skip)
            .limit(limit)
            .exec();

        res.json(result);
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

//해당하는글 들어가기
router.get('/api/object/get/detail/:id', async (req, res) => {
    try {
        const post = await Object_get.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");
        res.json(post);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

//글 작성하기
router.post('/api/object/get/write', async (req, res) => {
    try {
        const {
            user_id,
            date,
            atcId,
            fdPrdtNm,
            fdYmd,
            fdHor,
            fdPlace,
            uniq,
            fdSn,
            prdtClNm,
            depPlace,
            csteSteNm,
            orgId,
            orgNm,
            tel,
            fndKeepOrgnSeNm,
            fdFilePathImg
        } = req.body;

        // 필수 항목 체크
        if (!fdPrdtNm || !fdPlace || !depPlace) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다. (물품명, 습득장소, 보관장소)' });
        }

        const newPost = new Object_get({
            user_id,
            date: date || new Date(),
            atcId,
            fdPrdtNm,
            fdYmd,
            fdHor,
            fdPlace,
            uniq,
            fdSn,
            prdtClNm,
            depPlace,
            csteSteNm,
            orgId,
            orgNm,
            tel,
            fndKeepOrgnSeNm,
            fdFilePathImg
        });

        const saved = await newPost.save();

        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

//해당하는 글 수정하기
router.get('/api/object/get/edit/:id', async (req, res) => {
    try {
        const post = await Object_get.findById(req.params.id);
        if (!post) return res.status(404).send('게시글을 찾을 수 없습니다.');
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.put('/api/object/get/edit/:id', async (req, res) => {
    try {
        const { uniq } = req.body;
        await Object_get.findByIdAndUpdate(req.params.id, { uniq });
        res.json({ message: '수정 완료' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router