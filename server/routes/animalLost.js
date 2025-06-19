//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { AnimalLost } = require('../models/animalLost');
const multer = require('multer');
const fs = require('fs');
const coolsms = require('coolsms-node-sdk').default

const mongoose = require('mongoose');
const User = mongoose.models.User || require('../models/user');
//한 페이지당 보여줄 게시글 수
const show_list = 10;

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../images/animal_lost')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//SMS 알리기 API
const messageService = new coolsms(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);

//해당하는글 들어가기
/**
 * @swagger
 * /api/animal/lost/detail/{id}:
 *   get:
 *     summary: 실종 동물 상세 정보 조회
 *     description: 특정 실종 동물의 상세 정보를 조회합니다.
 *     tags: [Animal Lost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 실종 동물 게시글 ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 페이지 번호
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *         description: 검색 시작일
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *         description: 검색 종료일
 *       - in: query
 *         name: rfidCd
 *         schema:
 *           type: string
 *         description: RFID 코드
 *       - in: query
 *         name: happenDtStart
 *         schema:
 *           type: string
 *         description: 실종 시작일
 *       - in: query
 *         name: happenDtEnd
 *         schema:
 *           type: string
 *         description: 실종 종료일
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시/도
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시/군/구
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍/면/동
 *       - in: query
 *         name: sexCd
 *         schema:
 *           type: string
 *         description: 성별 코드
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: string
 *         description: 나이 시작 범위
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: string
 *         description: 나이 종료 범위
 *     responses:
 *       200:
 *         description: 성공적으로 실종 동물 정보를 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   description: 실종 동물 상세 정보
 *                 query:
 *                   type: object
 *                   description: 검색 조건 정보
 *       404:
 *         description: 실종 동물 정보를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await AnimalLost.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");

        const obj = post.toObject();

        // 현재 검색 조건 및 페이지 정보를 그대로 전달
        const queryInfo = {
            page: req.query.page || '1',
            search: req.query.search || '',
            dateStart: req.query.dateStart || '',
            dateEnd: req.query.dateEnd || '',
            rfidCd: req.query.rfidCd || '',
            happenDtStart: req.query.happenDtStart || '',
            happenDtEnd: req.query.happenDtEnd || '',
            si: req.query.si || '',
            sgg: req.query.sgg || '',
            emd: req.query.emd || '',
            sexCd: req.query.sexCd || '',
            ageStart: req.query.ageStart || '',
            ageEnd: req.query.ageEnd || ''
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
 * /api/animal/lost/write:
 *   post:
 *     summary: 실종 동물 게시글 작성
 *     description: 새로운 실종 동물 게시글을 작성합니다. 로그인이 필요한 기능입니다.
 *     tags: [Animal Lost]
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - happenDt
 *               - happenAddr
 *               - happenPlace
 *               - si
 *               - sgg
 *               - emd
 *               - kindCd
 *               - sexCd
 *               - age
 *               - specialMark
 *             properties:
 *               popfile:
 *                 type: string
 *                 format: binary
 *                 description: 실종 동물 이미지 파일
 *               rfidCd:
 *                 type: string
 *                 description: RFID 코드
 *               happenDt:
 *                 type: string
 *                 format: date
 *                 description: 실종 발생 일자
 *               happenAddr:
 *                 type: string
 *                 description: 실종 발생 주소
 *               happenAddrDtl:
 *                 type: string
 *                 description: 실종 발생 상세 주소
 *               happenPlace:
 *                 type: string
 *                 description: 실종 발생 장소
 *               si:
 *                 type: string
 *                 description: 시/도
 *               sgg:
 *                 type: string
 *                 description: 시/군/구
 *               emd:
 *                 type: string
 *                 description: 읍/면/동
 *               kindCd:
 *                 type: string
 *                 description: 동물 품종
 *               sexCd:
 *                 type: string
 *                 description: 성별 코드
 *               age:
 *                 type: integer
 *                 description: 동물 나이
 *               specialMark:
 *                 type: string
 *                 description: 특이사항
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 글이 성공적으로 등록되었습니다.
 *                 id:
 *                   type: string
 *                   description: 생성된 게시글의 ID
 *       400:
 *         description: 필수 항목 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 필수 항목이 누락되었습니다.
 *       401:
 *         description: 인증되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 로그인이 필요합니다.
 *       500:
 *         description: 서버 오류
 */
router.post('/write', upload.single('popfile'), async (req, res) => {
    try {

        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const {
            rfidCd,
            happenDt,
            happenAddr,
            happenAddrDtl,
            happenPlace,
            si,
            sgg,
            emd,
            kindCd,
            sexCd,
            age,
            specialMark,
        } = req.body;

        // 필수 항목 체크
        if (!happenDt || !happenAddr || !happenPlace || !si || !sgg || !emd || !kindCd || !sexCd || !age || !specialMark) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }

        const popfile = req.file
            ? `${req.protocol}://${req.get('host')}/api/images/animal_lost/${req.file.filename}`
            : null;

        const newPost = new AnimalLost({
            user_id: req.user._id,
            date: new Date(),
            rfidCd,
            callName: req.user.name,
            callTel: req.user.phone_number,
            happenDt,
            happenAddr,
            happenAddrDtl,
            happenPlace,
            si,
            sgg,
            emd,
            popfile,
            kindCd,
            sexCd,
            age,
            specialMark,
        });

        const saved = await newPost.save();
        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        res.status(500).send("Server Error")
    }
})

// 검색 목록
/**
 * @swagger
 * /api/animal/lost/search:
 *   get:
 *     summary: 실종 동물 게시글 검색
 *     description: 다양한 조건으로 실종 동물 게시글을 검색합니다.
 *     tags: [Animal Lost]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (품종, 주소, 특이사항에서 검색)
 *       - in: query
 *         name: rfidCd
 *         schema:
 *           type: string
 *         description: RFID 코드
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시글 작성일 시작 날짜
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시글 작성일 종료 날짜
 *       - in: query
 *         name: happenDtStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 실종 발생일 시작 날짜
 *       - in: query
 *         name: happenDtEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 실종 발생일 종료 날짜
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: integer
 *         description: 동물 나이 시작 범위
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: integer
 *         description: 동물 나이 종료 범위
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시/도
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시/군/구
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍/면/동
 *       - in: query
 *         name: sexCd
 *         schema:
 *           type: string
 *         description: 성별 코드
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지 번호
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *                 totalCount:
 *                   type: integer
 *                   description: 전체 검색 결과 수
 *                 results:
 *                   type: array
 *                   description: 검색된 게시글 목록
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: 게시글 ID
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: 게시글 작성일
 *                       rfidCd:
 *                         type: string
 *                         description: RFID 코드
 *                       happenDt:
 *                         type: string
 *                         format: date
 *                         description: 실종 발생일
 *                       happenAddr:
 *                         type: string
 *                         description: 실종 발생 주소
 *                       happenAddrDtl:
 *                         type: string
 *                         description: 실종 발생 상세 주소
 *                       happenPlace:
 *                         type: string
 *                         description: 실종 발생 장소
 *                       kindCd:
 *                         type: string
 *                         description: 동물 품종
 *                       sexCd:
 *                         type: string
 *                         description: 성별 코드
 *                       age:
 *                         type: integer
 *                         description: 동물 나이
 *                       popfile:
 *                         type: string
 *                         description: 동물 이미지 파일 경로
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 서버 오류
 */
router.get('/search', async (req, res) => {
    const {
        search,
        rfidCd,
        dateStart,
        dateEnd,
        happenDtStart,
        happenDtEnd,
        ageStart,
        ageEnd,
        si,
        sgg,
        emd,
        sexCd,
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
                    { kindCd: regex },
                    { happenAddr: regex },
                    { specialMark: regex }
                ]
            });
        }

        andConditions.push(...orGroup); // 모든 단어가 적어도 한 필드에 포함되어야 함
    }

    // 날짜 범위 (OR)
    const dateOrConditions = [];

    if (rfidCd) andConditions.push({ rfidCd: { $regex: rfidCd, $options: 'i' } });

    if (dateStart || dateEnd) {
        const range = {};
        if (dateStart) range.$gte = new Date(dateStart);
        if (dateEnd) range.$lte = new Date(new Date(dateEnd).setHours(23, 59, 59, 999));
        dateOrConditions.push({ date: range });
    }

    if (happenDtStart || happenDtEnd) {
        const range = {};
        if (happenDtStart) range.$gte = new Date(happenDtStart);
        if (happenDtEnd) range.$lte = new Date(new Date(happenDtEnd).setHours(23, 59, 59, 999));
        dateOrConditions.push({ happenDt: range });
    }

    if (dateOrConditions.length > 0) {
        andConditions.push({ $or: dateOrConditions });
    }

    // 나이 범위
    if (ageStart || ageEnd) {
        const ageRange = {};
        if (ageStart) ageRange.$gte = parseInt(ageStart);
        if (ageEnd) ageRange.$lte = parseInt(ageEnd);
        andConditions.push({ age: ageRange });
    }

    // si / sgg / emd는 개별 검색 (정확 일치)
    if (si) andConditions.push({ si: { $regex: si, $options: 'i' } });
    if (sgg) andConditions.push({ sgg: { $regex: sgg, $options: 'i' } });
    if (emd) andConditions.push({ emd: { $regex: emd, $options: 'i' } });

    // 성별
    if (sexCd) andConditions.push({ sexCd: { $regex: sexCd, $options: 'i' } });

    const finalQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    try {
        const skip = (parseInt(page) - 1) * parseInt(show_list);
        const limit = parseInt(show_list);

        const docs = await AnimalLost.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await AnimalLost.countDocuments(finalQuery);

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
* /api/animal/lost/notify/{id}:
 *   post:
 *     summary: 게시글 작성자에게 로그인한 사용자의 연락처 전송
 *     description: 게시글 상세 페이지에서 '알리기' 버튼 클릭 시, 해당 게시글 작성자에게 로그인한 사용자의 전화번호를 SMS로 전송합니다.
 *     tags:
 *       - Animal Lost
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
// routes/animalLost.js 내부에 추가
router.post('/notify/:id', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const post = await AnimalLost.findById(req.params.id);
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