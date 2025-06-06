//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { ObjectGet } = require('../models/objectGet');
const multer = require('multer');
const fs = require('fs');

//한 페이지당 보여줄 게시글 수
const show_list = 10;

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../images/object_get')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//해당하는글 들어가기
/**
 * @swagger
 * /api/object/get/detail/{id}:
 *   get:
 *     summary: 분실물 습득 게시글 상세 조회
 *     tags: [ObjectGet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 게시글의 MongoDB ObjectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 페이지 번호 (목록 복귀용)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 날짜 시작일
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 날짜 종료일
 *       - in: query
 *         name: fdYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 습득 일자 시작일
 *       - in: query
 *         name: fdYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 습득 일자 종료일
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
 *                     fdPrdtNm:
 *                       type: string
 *                     fdYmd:
 *                       type: string
 *                     fdHor:
 *                       type: string
 *                     fdPlace:
 *                       type: string
 *                     prdtClNm:
 *                       type: string
 *                     depPlace:
 *                       type: string
 *                     csteSteNm:
 *                       type: string
 *                     uniq:
 *                       type: string
 *                     fdSn:
 *                       type: string
 *                     fdSbjt:
 *                       type: string
 *                     orgNm:
 *                       type: string
 *                     tel:
 *                       type: string
 *                     orgId:
 *                       type: string
 *                     fndKeepOrgnSeNm:
 *                       type: string
 *                     atcId:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     fdFilePathImg:
 *                       type: string
 *                 query:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: string
 *                     search:
 *                       type: string
 *                     dateStart:
 *                       type: string
 *                     dateEnd:
 *                       type: string
 *                     fdYmdStart:
 *                       type: string
 *                     fdYmdEnd:
 *                       type: string
 *                     si:
 *                       type: string
 *                     sgg:
 *                       type: string
 *                     emd:
 *                       type: string
 *       404:
 *         description: 해당 ID의 게시글이 존재하지 않음
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Not found
 *       500:
 *         description: 서버 오류
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await ObjectGet.findById(req.params.id);
        if (!post) return res.status(404).send("Not found");

        const obj = post.toObject();

        // 현재 검색 조건 및 페이지 정보를 그대로 전달
        const queryInfo = {
            page: req.query.page || '1',
            search: req.query.search || '',
            dateStart: req.query.dateStart || '',
            dateEnd: req.query.dateEnd || '',
            fdYmdStart: req.query.fdYmdStart || '',
            fdYmdEnd: req.query.fdYmdEnd || '',
            si: req.query.si || '',
            sgg: req.query.sgg || '',
            emd: req.query.emd || ''
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
 * /api/object/get/write:
 *   post:
 *     summary: 분실물 습득 게시글 작성
 *     tags: [ObjectGet]
 *     security:
 *       - cookieAuth: []  # 세션 기반 인증 필요 시 사용
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fdPrdtNm
 *               - fdYmd
 *               - fdPlace
 *               - depPlace
 *             properties:
 *               fdPrdtNm:
 *                 type: string
 *                 description: 물품명 (필수)
 *               fdYmd:
 *                 type: string
 *                 format: date
 *                 description: 습득 일자 (필수)
 *               fdPlace:
 *                 type: string
 *                 description: 습득 장소 (필수)
 *               si:
 *                 type: string
 *                 description: 습득한 장소의 시/도 
 *               sgg:
 *                 type: string
 *                 description: 습득한 장소의 시군구
 *               emd:
 *                 type: string
 *                 description: 습득한 장소의 읍면동
 *               uniq:
 *                 type: string
 *                 description: 특이사항 (선택)
 *               prdtClNm:
 *                 type: string
 *                 description: 물품 분류명 (선택)
 *               depPlace:
 *                 type: string
 *                 description: 보관 장소 (필수)
 *               fdFilePathImg:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일 (선택)
 *     responses:
 *       201:
 *         description: 게시글 등록 성공
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server Error
 */
router.post('/write', upload.single('fdFilePathImg'), async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: '로그인이 필요합니다.' });
        }

        const {
            fdPrdtNm,
            fdYmd,
            fdPlace,
            si,
            sgg,
            emd,
            uniq,
            prdtClNm,
            depPlace
        } = req.body;

        // 필수 항목 체크
        if (!fdPrdtNm || !fdYmd || !fdPlace || !depPlace) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }

        const fdFilePathImg = req.file
            ? `${req.protocol}://${req.get('host')}/api/images/object_get/${req.file.filename}`
            : null;

        const newPost = new ObjectGet({
            user_id: req.user._id,
            date: new Date(),
            fdPrdtNm,
            fdYmd,
            fdPlace,
            si,
            sgg,
            emd,
            uniq,
            prdtClNm,
            depPlace,
            fdFilePathImg,
            tel: req.user.phone_number,
        });

        const saved = await newPost.save();
        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 게시글 총 개수 반환 API
/**
 * @swagger
 * /api/object/get/search:
 *   get:
 *     summary: 분실물 습득 게시글 검색
 *     tags: [ObjectGet]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (물품명, 장소, 분류, 특이사항 등)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 날짜 시작일    
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 날짜 종료일
 *       - in: query
 *         name: fdYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 습득 일자 시작일
 *       - in: query
 *         name: fdYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 습득 일자 종료일
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 검색 결과 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalCount:
 *                   type: integer
 *                   example: 50
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fdPrdtNm:
 *                         type: string
 *                         description: 물품명
 *                       fdPlace:
 *                         type: string
 *                       prdtClNm:
 *                         type: string
 *                       uniq:
 *                         type: string
 *                       depPlace:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       fdFilePathImg:
 *                         type: string
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
        dateStart,
        dateEnd,
        fdYmdStart,
        fdYmdEnd,
        si,
        sgg,
        emd,
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
                    { fdPrdtNm: regex },
                    { fdPlace: regex },
                    { prdtClNm: regex },
                    { uniq: regex },
                    { depPlace: regex },
                    { fndKeepOrgnSeNm: regex }
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

    if (fdYmdStart || fdYmdEnd) {
        const range = {};
        if (fdYmdStart) range.$gte = new Date(fdYmdStart);
        if (fdYmdEnd) range.$lte = new Date(new Date(fdYmdEnd).setHours(23, 59, 59, 999));
        dateOrConditions.push({ lstYmd: range });
    }

    if (dateOrConditions.length > 0) {
        andConditions.push({ $or: dateOrConditions });
    }

    // si / sgg / emd는 개별 검색 (정확 일치)
    if (si) andConditions.push({ si: { $regex: si, $options: 'i' } });
    if (sgg) andConditions.push({ sgg: { $regex: sgg, $options: 'i' } });
    if (emd) andConditions.push({ emd: { $regex: emd, $options: 'i' } });

    const finalQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    try {
        const skip = (parseInt(page) - 1) * parseInt(show_list);
        const limit = parseInt(show_list);

        const docs = await ObjectGet.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await ObjectGet.countDocuments(finalQuery);

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