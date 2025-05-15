//시작
const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { Object_lost } = require('../models/object_lost.js');

//한 페이지당 보여줄 게시글 수
const show_list = process.env.SHOW_LIST

//object 내용
//글 목록 보여주기
// 글 목록 JSON 데이터 응답, 데이터베이스를 사용하기 떄문에 /api사용
//// 신고 목록 API

/**
 * @swagger
 * /api/object/lost/list/{num}:
 *   get:
 *     summary: 분실물 게시글 목록 조회 (페이지네이션)
 *     tags: [ObjectLost]
 *     parameters:
 *       - in: path
 *         name: num
 *         required: true
 *         schema:
 *           type: integer
 *         description: 요청할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 분실물 게시글 목록 응답
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: MongoDB ObjectId
 *                   lstPrdtNm:
 *                     type: string
 *                     example: "검정색 백팩"
 *                     description: 물품명
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-15"
 *                     description: 게시 날짜
 *                   lstPlace:
 *                     type: string
 *                     example: "서울역 2층 보관소"
 *                     description: 보관 장소
 *       500:
 *         description: 서버 오류
 */
router.get('/list/:num', async (req, res) => {
    try {
        const page = parseInt(req.params.num) || 1;
        const limit = show_list || 10;
        const skip = (page - 1) * limit;

        const result = await Object_lost.find({})
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
/**
 * @swagger
 * /api/object/lost/detail/{id}:
 *   get:
 *     summary: 분실물 게시글 상세 조회
 *     tags: [ObjectLost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글의 MongoDB ObjectId
 *     responses:
 *       200:
 *         description: 게시글 상세 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lstPrdtNm:
 *                   type: string
 *                   description: 물품명
 *                   example: 지갑
 *                 lstYmd:
 *                   type: string
 *                   description: 분실 일자
 *                   example: "2025-05-01"
 *                 lstHor:
 *                   type: string
 *                   description: 분실 시간
 *                   example: "14:30"
 *                 lstPlace:
 *                   type: string
 *                   description: 분실 장소
 *                   example: 서울역 2층 대합실
 *                 prdtClNm:
 *                   type: string
 *                   description: 물품 분류명
 *                   example: 전자기기
 *                 lstSteNm:
 *                   type: string
 *                   description: 상태
 *                   example: 보관 중
 *                 lstLctNm:
 *                   type: string
 *                   description: 지역
 *                   example: 서울특별시
 *                 si:
 *                   type: string
 *                   description: 시/도
 *                   example: 서울특별시
 *                 sgg:
 *                   type: string
 *                   description: 시군구
 *                   example: 강남구
 *                 emd:
 *                   type: string
 *                   description: 읍면동
 *                   example: 역삼동
 *                 uniq:
 *                   type: string
 *                   description: 특이사항
 *                   example: 검정색 가죽지갑, 로고 있음
 *                 lstSbjt:
 *                   type: string
 *                   description: 게시 제목
 *                   example: 지갑을 잃어버렸습니다
 *                 orgNm:
 *                   type: string
 *                   description: 기관명
 *                   example: 서울역 분실물 센터
 *                 tel:
 *                   type: string
 *                   description: 기관 전화번호
 *                   example: 02-1234-5678
 *                 orgId:
 *                   type: string
 *                   description: 기관 ID
 *                   example: ORG001
 *                 lstPlaceSeNm:
 *                   type: string
 *                   description: 분실장소 구분명
 *                   example: 역사 내부
 *                 atcId:
 *                   type: string
 *                   description: 관리 ID
 *                   example: ATC123456
 *                 user_id:
 *                   type: string
 *                   description: 작성자 ID
 *                   example: user@example.com
 *                 date:
 *                   type: string
 *                   description: 게시 날짜 (YYYY-MM-DD HH:MM)
 *                   example: "2025-05-15 15:30"
 *                 lstFilePathImg:
 *                   type: string
 *                   description: 이미지 URL
 *                   example: "https://example.com/image.jpg"
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await Object_lost.findById(req.params.id);
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
/**
 * @swagger
 * /api/object/lost/write:
 *   post:
 *     summary: 분실물 게시글 작성
 *     tags: [ObjectLost]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lstPrdtNm
 *               - lstYmd
 *               - lstPlace
 *               - lstSbjt
 *             properties:
 *               lstFilePathImg:
 *                 type: string
 *                 description: 이미지 URL
 *                 example: https://example.com/image.jpg
 *               tel:
 *                 type: string
 *                 description: 기관 전화번호
 *                 example: 02-1234-5678
 *               lstLctNm:
 *                 type: string
 *                 description: 분실 지역명
 *                 example: 서울특별시
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: 게시 날짜
 *                 example: "2025-05-15"
 *               lstPrdtNm:
 *                 type: string
 *                 description: 물품명
 *                 example: 스마트폰
 *               lstYmd:
 *                 type: string
 *                 description: 분실 일자
 *                 example: "2025-05-10"
 *               lstPlace:
 *                 type: string
 *                 description: 분실 장소
 *                 example: 강남역
 *               si:
 *                 type: string
 *                 description: 시/도
 *                 example: 서울특별시
 *               sgg:
 *                 type: string
 *                 description: 시군구
 *                 example: 강남구
 *               emd:
 *                 type: string
 *                 description: 읍면동
 *                 example: 역삼동
 *               uniq:
 *                 type: string
 *                 description: 특이사항
 *                 example: 케이스에 스티커 있음
 *               lstSbjt:
 *                 type: string
 *                 description: 게시 제목
 *                 example: 아이폰 분실했습니다
 *               prdtClNm:
 *                 type: string
 *                 description: 물품분류명
 *                 example: 전자기기
 *     responses:
 *       201:
 *         description: 게시글이 성공적으로 작성됨
 *       400:
 *         description: 필수 항목 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/write', async (req, res) => {
    try {
        const {
            date,
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            si,
            sgg,
            emd,
            prdtClNm,
            uniq,
            lstLctNm,
            lstSbjt,
            lstFilePathImg
        } = req.body;

        // 필수 항목 체크
        if (!lstPrdtNm || !lstYmd || !lstPlace) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }

        const newPost = new Object_lost({
            date: date || new Date(),
            lstPrdtNm,
            lstYmd,
            lstHor,
            lstPlace,
            si,
            sgg,
            emd,
            prdtClNm,
            uniq,
            lstLctNm,
            lstSbjt,
            lstFilePathImg,
            tel: req.user.phone_number,
        });

        const saved = await newPost.save();

        res.status(201).json({ message: '글이 성공적으로 등록되었습니다.', id: saved._id });
    } catch (err) {
        console.error("Error writing lost post:", err.message);
        res.status(500).json({ error: "Server Error" });  // JSON 응답으로 수정
    }
});

// 게시글 총 개수 반환 API
/**
 * @swagger
 * /api/object/lost/count:
 *   get:
 *     summary: 게시글 총 페이지 수 조회
 *     tags: [ObjectLost]
 *     responses:
 *       200:
 *         description: 총 페이지 수 반환 (10개 단위 페이징 기준)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                   example: 5
 *                   description: 전체 페이지 수 (게시글 수 / 10, 올림 처리)
 *       500:
 *         description: 서버 오류
 */
router.get('/count', async (req, res) => {
    try {
        const totalCount = await Object_lost.countDocuments({});
        res.json({ totalCount: Math.ceil(totalCount / 10) });
    } catch (err) {
        console.error('게시글 수 조회 오류:', err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router