//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { RewardAnimal } = require('../models/rewardAnimal');
const multer = require('multer');
const fs = require('fs');

//한 페이지당 보여줄 게시글 수
const show_list = 10;

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../images/reward_animal')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//해당하는글 들어가기
/**
 * @swagger
 * /detail/{id}:
 *   get:
 *     summary: 보상 동물 상세 조회
 *     description: 보상 동물의 고유 ID로 상세 정보를 조회하고, 현재 검색 조건들을 함께 반환합니다.
 *     tags: [RewardAnimal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 보상 동물의 MongoDB ObjectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: 현재 페이지 번호
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 검색 시작일 (YYYY-MM-DD)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 검색 종료일 (YYYY-MM-DD)
 *       - in: query
 *         name: rfidCd
 *         schema:
 *           type: string
 *         description: RFID 코드
 *       - in: query
 *         name: happenDtStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 발생일 시작
 *       - in: query
 *         name: happenDtEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 발생일 종료
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시 (행정구역)
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시군구 (행정구역)
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍면동 (행정구역)
 *       - in: query
 *         name: sexCd
 *         schema:
 *           type: string
 *         description: 성별 코드 ()
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: string
 *         description: 시작 나이
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: string
 *         description: 종료 나이
 *     responses:
 *       200:
 *         description: 보상 동물 상세 정보와 검색 조건 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   description: 보상 동물의 상세 정보
 *                 query:
 *                   type: object
 *                   description: 전달된 검색 조건 정보
 *       404:
 *         description: 해당 ID의 데이터를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await RewardAnimal.findById(req.params.id);
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
 * /write:
 *   post:
 *     summary: 유기 동물 포상금 게시글 작성
 *     description: 로그인한 사용자가 유기 동물 포상금 게시글을 작성합니다. 파일 업로드 포함.
 *     tags: [RewardAnimal]
 *     security:
 *       - cookieAuth: []  # 또는 bearerAuth: [] 사용 중인 인증 방식에 맞게 설정
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - happenDt
 *               - happenAddr
 *               - kindCd
 *               - sexCd
 *               - age
 *               - specialMark
 *               - reward
 *               - rfidCd
 *             properties:
 *               lstFilePathImg:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *               happenDt:
 *                 type: string
 *                 format: date
 *                 description: 유기 발생일
 *               happenAddr:
 *                 type: string
 *                 description: 유기 발생 주소
 *               happenPlace:
 *                 type: string
 *                 description: 유기 발생 장소 상세
 *               rfidCd:
 *                 type: string
 *                 description: RFID 코드
 *               popfile:
 *                 type: string
 *                 description: 이미지 경로 또는 URL
 *               kindCd:
 *                 type: string
 *                 description: 동물 품종
 *               sexCd:
 *                 type: string
 *                 description: 성별 코드 
 *               age:
 *                 type: string
 *                 description: 나이
 *               specialMark:
 *                 type: string
 *                 description: 특징
 *               reward:
 *                 type: integer
 *                 description: 포상금 정보
 *     responses:
 *       201:
 *         description: 게시글이 성공적으로 등록됨
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
 *                   description: 저장된 게시글의 MongoDB ObjectId
 *       400:
 *         description: 필수 항목 누락
 *       401:
 *         description: 인증되지 않음 (로그인 필요)
 *       500:
 *         description: 서버 오류
 */
router.post('/write', upload.single('popfile'), async (req, res) => {
    try {

        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const {
            happenDt,
            happenAddr,
            happenPlace,
            si,
            sgg,
            emd,
            rfidCd,
            kindCd,
            sexCd,
            age,
            specialMark,
            reward
        } = req.body;

        // 필수 항목 체크
        if (!happenDt || !happenAddr || !happenPlace || !si || !sgg || !emd || !kindCd || !sexCd || !age || !specialMark) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }
        
        const popfile = req.file
            ? `${req.protocol}://${req.get('host')}/api/images/reward_aniaml/${req.file.filename}`
            : null;

        const newPost = new RewardAnimal({
            user_id: req.user._id,
            date: new Date(),
            callName: req.user.name,
            rfidCd,
            happenDt,
            happenAddr,
            happenPlace,
            si,
            sgg,
            emd,
            popfile,
            kindCd,
            sexCd,
            age,
            specialMark,
            lstFilePathImg,
            reward,
            callTel: req.user.phone_number,
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
 * /search:
 *   get:
 *     summary: 유기 동물 포상금 게시글 검색
 *     description: 다양한 조건을 이용하여 유기 동물 포상금 게시글을 검색합니다.
 *     tags: [RewardAnimal]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 키워드 검색 (kindCd, happenAddr, specialMark 에서 검색됨)
 *       - in: query
 *         name: rfidCd
 *         schema:
 *           type: string
 *         description: RFID 코드 검색
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 등록일 시작
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 등록일 종료
 *       - in: query
 *         name: happenDtStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 유기 발생일 시작
 *       - in: query
 *         name: happenDtEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 유기 발생일 종료
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: string
 *         description: 시작 나이
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: string
 *         description: 종료 나이
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시(행정구역)
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시군구(행정구역)
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍면동(행정구역)
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
 *         description: 검색 결과 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 유기 동물 게시글 객체
 *       500:
 *         description: 서버 오류
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

        const docs = await RewardAnimal.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await RewardAnimal.countDocuments(finalQuery);

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

module.exports = router