//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { Reward_object } = require('../models/reward_object');

//한 페이지당 보여줄 게시글 수
const show_list = process.env.SHOW_LIST

//글 목록 보여주기
router.get('/list/:num', async (req, res) => {
    try {
        const page = parseInt(req.params.num) || 1;
        const limit = show_list || 10;
        const skip = (page - 1) * limit;

        const result = await Reward_object.find({})
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const formatted = result.map(doc => {
            const obj = doc.toObject();
            obj.date = obj.date ? obj.date.toISOString().split('T')[0] : null;
            return obj;
        });

        res.json(formatted);
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

//해당하는글 들어가기
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await Reward_object.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");

        const obj = post.toObject();
        const iso = obj.date.toISOString();
        const [datePart, timePart] = iso.split('T');
        const time = timePart.slice(0, 5);
        obj.date = `${datePart} ${time}`;

        res.json(obj);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

//글 작성하기
router.post('/write', async (req, res) => {
    try {
        const {
            date,
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            prdtClNm,
            lstSteNm,
            uniq,
            lstLctNm,
            lstSbjt,
            lstPlaceSeNm,
            lstFilePathImg,
            reward
        } = req.body;

        // 필수 항목 체크
        if (!lstPrdtNm || !lstYmd || !lstPlace || !reward) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다. (id, user_id, 제목)' });
        }

        const newPost = new Reward_object({
            user_id: req.user.email,
            date: date || new Date(),
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            prdtClNm,
            lstSteNm,
            uniq,
            lstLctNm,
            lstSbjt,
            lstPlaceSeNm,
            lstFilePathImg,
            reward
        });

        const saved = await newPost.save();
        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        res.status(500).send("Server Error")
    }
})

// 게시글 총 개수 반환 API
router.get('/count', async (req, res) => {
    try {
        const totalCount = await Reward_object.countDocuments({});
        res.json({ totalCount: Math.ceil(totalCount / 10) });
    } catch (err) {
        console.error('게시글 수 조회 오류:', err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router