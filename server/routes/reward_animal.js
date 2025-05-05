//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { Reward_animal } = require('../models/reward_animal');

//한 페이지당 보여줄 게시글 수
const show_list = process.env.SHOW_LIST

//글 목록 보여주기
router.get('/api/reward/animal/list/:num', async (req, res) => {
    try {
        const page = parseInt(req.params.num) || 1;
        const limit = parseInt(process.env.SHOW_LIST) || 10;
        const skip = (page - 1) * limit;

        const result = await Reward_animal.find({})
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
router.get('/api/reward/animal/detail/:id', async (req, res) => {
    try {
        const post = await Reward_animal.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");
        res.json(post);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

//글 작성하기
router.post('/api/reward/animal/write', async (req, res) => {
    try {
        const {
            id,
            user_id,
            date,
            callName,
            callTel,
            happenDt,
            happenAddr,
            happenAddrDtl,
            happenPlace,
            popfile,
            kindCd,
            sexCd,
            age,
            specialMark,
            reward
        } = req.body;

        // 필수 항목 체크
        if (!id || !user_id || !happenPlace) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다. (id, user_id, 발견장소)' });
        }

        const newPost = new Reward_animal({
            id,
            user_id,
            date: date || new Date(),
            callName,
            callTel,
            happenDt,
            happenAddr,
            happenAddrDtl,
            happenPlace,
            popfile,
            kindCd,
            sexCd,
            age,
            specialMark,
            reward
        });

        const saved = await newPost.save();
        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        res.status(500).send("Server Error")
    }
})

//해당하는 글 수정하기
router.get('/api/reward/animal/edit/:id', async (req, res) => {
    try {
        const post = await Reward_animal.findById(req.params.id);
        if (!post) return res.status(404).send('게시글을 찾을 수 없습니다.');
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.put('/api/reward/animal/edit/:id', async (req, res) => {
    try {
        const { specialMark } = req.body;
        await Reward_animal.findByIdAndUpdate(req.params.id, { specialMark });
        res.json({ message: '수정 완료' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router