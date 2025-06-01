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
 * /api/reward/animal/detail/{id}:
 *   get:
 *     summary: 유기 동물 포상금 상세 정보 조회
 *     tags: [RewardAnimal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 동물 게시글의 MongoDB ObjectId
 *         schema:
 *           type: string
 *           example: 6650d376e8237b07dcd5461b
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           example: "1"
 *         description: 현재 페이지 번호 (선택)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: 믹스견 갈색
 *         description: 통합 검색어 (선택)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-05-01
 *         description: 게시 시작일 (선택)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-05-31
 *         description: 게시 종료일 (선택)
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-04-01
 *         description: 유기 시작일 (선택)
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-04-30
 *         description: 유기 종료일 (선택)
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *           example: 서울특별시
 *         description: 시/도 (선택)
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *           example: 강남구
 *         description: 시군구 (선택)
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *           example: 역삼동
 *         description: 읍면동 (선택)
 *       - in: query
 *         name: sexCd
 *         schema:
 *           type: string
 *           example: 암컷
 *         description: 성별 (선택, 수컷, 암컷, 미상)
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: string
 *           example: "1"
 *         description: 최소 나이
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: string
 *           example: "5"
 *         description: 최대 나이
 *     responses:
 *       200:
 *         description: 게시글과 쿼리 조건 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   description: 유기 동물 포상금 게시글 상세 정보
 *                   example:
 *                     _id: 6650d376e8237b07dcd5461b
 *                     happenDt: "2025-04-15"
 *                     kindCd: "믹스견"
 *                     sexCd: "암컷"
 *                     age: 3
 *                     happenAddr: "서울 강남구 역삼동"
 *                     specialMark: "왼쪽 눈 주위에 흰털"
 *                     popfile: "https://example.com/image.jpg"
 *                     reward: 50000
 *                 query:
 *                   type: object
 *                   description: 검색 조건 정보 (query string 복원용)
 *                   example:
 *                     page: "1"
 *                     search: "푸들"
 *                     dateStart: "2025-05-01"
 *                     dateEnd: "2025-05-31"
 *                     lstYmdStart: "2025-04-01"
 *                     lstYmdEnd: "2025-04-30"
 *                     si: "서울특별시"
 *                     sgg: "강남구"
 *                     emd: "역삼동"
 *                     sexCd: "암컷"
 *                     ageStart: "1"
 *                     ageEnd: "5"
 *       404:
 *         description: 게시글이 존재하지 않음
 *       500:
 *         description: 서버 오류
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
            lstYmdStart: req.query.lstYmdStart || '',
            lstYmdEnd: req.query.lstYmdEnd || '',
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
 * /api/reward/animal/write:
 *   post:
 *     summary: 유기 동물 포상금 게시글 작성
 *     tags: [RewardAnimal]
 *     security:
 *       - cookieAuth: []  # 세션 쿠키 인증
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
 *             properties:
 *               happenDt:
 *                 type: string
 *                 description: 유기 발생 일자
 *               happenAddr:
 *                 type: string
 *                 description: 유기 발생 주소
 *               happenPlace:
 *                 type: string
 *                 description: 주변 건물
 *               si:
 *                 type: string
 *                 description: 시/도
 *               sgg:
 *                 type: string
 *                 description: 시군구
 *               emd:
 *                 type: string
 *                 description: 읍면동
 *               popfile:
 *                 type: string
 *                 description: 이미지
 *               kindCd:
 *                 type: string
 *                 description: 품종
 *               sexCd:
 *                 type: string
 *                 description: 성별 (수컷, 암컷, 미상)
 *               age:
 *                 type: integer
 *                 description: 나이 (살 단위, 정수)
 *               specialMark:
 *                 type: string
 *                 description: 특이사항
 *               reward:
 *                 type: integer
 *                 description: 보상금
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
            happenDt,
            happenAddr,
            happenPlace,
            popfile,
            kindCd,
            sexCd,
            age,
            specialMark,
            reward
        } = req.body;

        // 필수 항목 체크
        if (!happenDt || !happenAddr || !kindCd || !sexCd || !age || !specialMark || !reward) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }

        const newPost = new RewardAnimal({
            user_id: req.user._id,
            date: new Date(),
            callName: req.user.name,
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
 * /api/reward/animal/search:
 *   get:
 *     summary: 유기 동물 포상금 게시글 검색 및 목록 조회
 *     tags: [RewardAnimal]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (품종, 유기 주소, 특이사항 등)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시일 시작 범위
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시일 종료 범위
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 유기일 시작 범위
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 유기일 종료 범위
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: integer
 *         description: 최소 나이 (살 단위)
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: integer
 *         description: 최대 나이 (살 단위)
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *         description: 시/도
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *         description: 시군구
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *         description: 읍면동
 *       - in: query
 *         name: sexCd
 *         schema:
 *           type: string
 *         description: 성별 (수컷, 암컷, 미상)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 요청할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 검색된 게시글 목록과 페이지 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지 번호
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *                   example: 5
 *                 totalCount:
 *                   type: integer
 *                   description: 총 검색 결과 수
 *                   example: 42
 *                 results:
 *                   type: array
 *                   description: 검색된 게시글 목록
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6650d376e8237b07dcd5461b"
 *                       kindCd:
 *                         type: string
 *                         example: 믹스견
 *                       happenAddr:
 *                         type: string
 *                         example: 서울 강남구 도곡로12길
 *                       specialMark:
 *                         type: string
 *                         example: 왼쪽 눈 주위에 흰 털
 *                       sexCd:
 *                         type: string
 *                         example: 수컷
 *                       age:
 *                         type: integer
 *                         example: 3
 *                       date:
 *                         type: string
 *                         example: "2025-05-20"
 *                       popfile:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
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
router.get('/search', async (req, res) => {
    const {
        search,
        dateStart,
        dateEnd,
        lstYmdStart,
        lstYmdEnd,
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