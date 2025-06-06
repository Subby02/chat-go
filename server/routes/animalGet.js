//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { AnimalGet } = require('../models/animalGet');
const multer = require('multer');
const fs = require('fs');

//한 페이지당 보여줄 게시글 수
const show_list = 10;

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../images/animal_get')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//해당하는글 들어가기
/**
 * @swagger
 * /api/animal/get/detail/{id}:
 *   get:
 *     summary: 특정 동물 찾기 게시글의 상세 정보를 조회합니다.
 *     tags: [AnimalGet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
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
 *         description: 시작 날짜
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *         description: 종료 날짜
 *     responses:
 *       200:
 *         description: 게시글 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id: 
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     rfidCd:
 *                       type: string
 *                     callName:
 *                       type: string
 *                     callTel:
 *                       type: string
 *                     happenDt:
 *                       type: string
 *                     happenPlace:
 *                       type: string
 *                     si:
 *                       type: string
 *                     sgg:
 *                       type: string
 *                     emd:
 *                       type: string
 *                     kindNm:
 *                       type: string
 *                     colorCd:
 *                       type: string
 *                     age:
 *                       type: number
 *                     weight:
 *                       type: number
 *                     popfile:
 *                       type: string
 *                     processState:
 *                       type: string
 *                     sexCd:
 *                       type: string
 *                     neuterYn:
 *                       type: string
 *                     specialMark:
 *                       type: string
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await AnimalGet.findById(req.params.id);
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
 * /api/animal/get/write:
 *   post:
 *     summary: 새로운 동물 찾기 게시글을 작성합니다.
 *     tags: [AnimalGet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - happenDt
 *               - happenPlace
 *               - si
 *               - sgg
 *               - emd
 *               - kindNm
 *               - colorCd
 *               - sexCd
 *               - age
 *               - weight
 *               - specialMark
 *             properties:
 *               popfile:
 *                 type: string
 *                 format: binary
 *                 description: 동물 이미지 파일
 *               rfidCd:
 *                 type: string
 *                 description: RFID 코드
 *               happenDt:
 *                 type: string
 *                 format: date
 *                 description: 발견 날짜
 *               happenPlace:
 *                 type: string
 *                 description: 발견 장소
 *               si:
 *                 type: string
 *                 description: 시/도
 *               sgg:
 *                 type: string
 *                 description: 시/군/구
 *               emd:
 *                 type: string
 *                 description: 읍/면/동
 *               kindNm:
 *                 type: string
 *                 description: 품종
 *               colorCd:
 *                 type: string
 *                 description: 색상
 *               age:
 *                 type: number
 *                 description: 나이
 *               weight:
 *                 type: number
 *                 description: 체중
 *               sexCd:
 *                 type: string
 *                 description: 성별
 *               neuterYn:
 *                 type: string
 *                 description: 중성화 여부
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
 *                 id:
 *                   type: string
 *       400:
 *         description: 필수 항목 누락
 *       401:
 *         description: 인증되지 않은 사용자
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
            happenPlace,
            si,
            sgg,
            emd,
            kindNm,
            colorCd,
            age,
            weight,
            processState,
            sexCd,
            neuterYn,
            specialMark,
        } = req.body;

        // 필수 항목 체크
        if (!happenDt || !happenPlace || !si || !sgg || !emd || !kindNm || !colorCd || !sexCd || !age || !weight || !specialMark) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }
        
        const popfile = req.file
            ? `${req.protocol}://${req.get('host')}/api/images/animal_get/${req.file.filename}`
            : null;

        const newPost = new AnimalGet({
            user_id: req.user._id,
            date: new Date(),
            rfidCd,
            callName: req.user.name,
            callTel: req.user.phone_number,
            happenDt,
            happenPlace,
            si,
            sgg,
            emd,
            kindNm,
            colorCd,
            age,
            weight,
            popfile,
            processState,
            sexCd,
            neuterYn,
            specialMark,
        });

        const saved = await newPost.save();
        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        console.log(err)
        res.status(500).send("Server Error")
    }
})

// 검색 목록
/**
 * @swagger
 * /api/animal/get/search:
 *   get:
 *     summary: 동물 찾기 게시글을 검색합니다.
 *     tags: [AnimalGet]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (품종, 발견장소, 색상, 상태, 특이사항)
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
 *         description: 게시글 작성 시작일
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시글 작성 종료일
 *       - in: query
 *         name: happenDtStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 발견 시작일
 *       - in: query
 *         name: happenDtEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 발견 종료일
 *       - in: query
 *         name: ageStart
 *         schema:
 *           type: integer
 *         description: 최소 나이
 *       - in: query
 *         name: ageEnd
 *         schema:
 *           type: integer
 *         description: 최대 나이
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
 *         description: 성별
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
 *                 totalPages:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       rfidCd:
 *                         type: string
 *                       happenDt:
 *                         type: string
 *                         format: date
 *                       happenPlace:
 *                         type: string
 *                       kindNm:
 *                         type: string
 *                       colorCd:
 *                         type: string
 *                       age:
 *                         type: number
 *                       processState:
 *                         type: string
 *                       sexCd:
 *                         type: string
 *                       popfile:
 *                         type: string
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
                    { kindNm: regex },
                    { happenPlace: regex },
                    { colorCd: regex },
                    { processState: regex },
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

        const docs = await AnimalGet.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await AnimalGet.countDocuments(finalQuery);

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