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
const { User } = require('../models/user.js');

//한 페이지당 보여줄 게시글 수
const show_list = process.env.SHOW_LIST

//object 내용
//글 목록 보여주기
// 글 목록 JSON 데이터 응답, 데이터베이스를 사용하기 떄문에 /api사용
//// 제보 목록 API
/**
 * @swagger
 * /api/object/get/list/{num}:
 *   get:
 *     summary: 제보 게시글 목록 조회 (페이지네이션)
 *     tags: [ObjectGet]
 *     parameters:
 *       - in: path
 *         name: num
 *         required: true
 *         schema:
 *           type: integer
 *         description: 요청할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 제보 게시글 목록 응답
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
 *                   fdPrdtNm:
 *                     type: string
 *                     example: "검정색 우산"
 *                     description: 물품명
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-15"
 *                     description: 게시 날짜
 *                   depPlace:
 *                     type: string
 *                     example: "서울역 보관소"
 *                     description: 보관 장소
 *       500:
 *         description: 서버 오류
 */
router.get('/list/:num', async (req, res) => {
    try {
        const page = parseInt(req.params.num) || 1;
        const limit = show_list || 10;
        const skip = (page - 1) * limit;

        const result = await Object_get.find({})
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
 * /api/object/get/detail/{id}:
 *   get:
 *     summary: 제보 게시글 상세 조회
 *     tags: [ObjectGet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글의 MongoDB ObjectId
 *     responses:
 *       200:
 *         description: 제보 상세 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: 작성자 ID
 *                   example: user@example.com
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: 게시 날짜
 *                   example: "2025-05-15"
 *                 atcId:
 *                   type: string
 *                   description: 관리 ID
 *                   example: ATC987654
 *                 fdPrdtNm:
 *                   type: string
 *                   description: 물품명
 *                   example: 검정색 가방
 *                 fdYmd:
 *                   type: string
 *                   description: 습득 일자 (YYYY-MM-DD HH:MM)
 *                   example: "2025-05-10 13:40"
 *                 fdHor:
 *                   type: string
 *                   description: 습득 시간
 *                   example: "14:30"
 *                 fdPlace:
 *                   type: string
 *                   description: 습득 장소
 *                   example: 서울역 2층 대합실
 *                 uniq:
 *                   type: string
 *                   description: 특이사항
 *                   example: 가방에 스티커 있음
 *                 fdSn:
 *                   type: string
 *                   description: 습득 순번
 *                   example: FD123456
 *                 prdtClNm:
 *                   type: string
 *                   description: 물품분류명
 *                   example: 전자기기
 *                 depPlace:
 *                   type: string
 *                   description: 보관 장소
 *                   example: 서울역 보관소
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
 *                 csteSteNm:
 *                   type: string
 *                   description: 보관상태명
 *                   example: 보관 중
 *                 orgNm:
 *                   type: string
 *                   description: 기관명
 *                   example: 서울역 분실물 센터
 *                 orgId:
 *                   type: string
 *                   description: 기관 ID
 *                   example: ORG001
 *                 tel:
 *                   type: string
 *                   description: 전화번호
 *                   example: 02-1234-5678
 *                 fndKeepOrgnSeNm:
 *                   type: string
 *                   description: 습득물보관기관구분명
 *                   example: 철도 경찰
 *                 fdFilePathImg:
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
        const post = await Object_get.findById(req.params.id);
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
 * /api/object/get/write:
 *   post:
 *     summary: 제보 게시글 작성
 *     tags: [ObjectGet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fdPrdtNm
 *               - fdYmd
 *               - fdPlace
 *               - depPlace
 *             properties:
 *               fdFilePathImg:
 *                 type: string
 *                 description: 이미지 URL
 *                 example: https://example.com/image.jpg
 *               tel:
 *                 type: string
 *                 description: 사용자 전화번호
 *                 example: 010-1234-5678
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: 게시 날짜
 *                 example: "2025-05-15"
 *               fdPrdtNm:
 *                 type: string
 *                 description: 물품명
 *                 example: 지갑
 *               fdYmd:
 *                 type: string
 *                 description: 습득 날짜
 *                 example: "2025-05-10"
 *               fdPlace:
 *                 type: string
 *                 description: 습득 장소
 *                 example: 서울역 2층
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
 *                 description: 특이 사항
 *                 example: 검정색 가죽 지갑, 로고 있음
 *               prdtClNm:
 *                 type: string
 *                 description: 물품 분류명
 *                 example: 전자기기
 *               depPlace:
 *                 type: string
 *                 description: 보관 장소
 *                 example: 서울역 보관소
 *     responses:
 *       201:
 *         description: 게시글이 성공적으로 작성됨
 *       400:
 *         description: 필수 항목 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/write', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const {
                date,
                fdPrdtNm,
                fdYmd,
                fdPlace,
                uniq,
                prdtClNm,
                depPlace,
                fdFilePathImg
            } = req.body;

            // 필수 항목 체크
            if (!fdPrdtNm || !fdYmd || !fdPlace || !depPlace) {
                return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
            }
            const newPost = new Object_get({
                date: date || new Date(),
                fdPrdtNm,
                fdYmd,
                fdPlace,
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
    } else {
        res.status(404).send("NO Login");
    }
});

// 게시글 총 개수 반환 API
/**
 * @swagger
 * /api/object/get/count:
 *   get:
 *     summary: 제보 게시글 총 페이지 수 조회
 *     tags: [ObjectGet]
 *     responses:
 *       200:
 *         description: 전체 게시글 수를 기반으로 한 총 페이지 수 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                   example: 5
 *                   description: 전체 페이지 수 (10개 단위로 계산, 올림 처리)
 *       500:
 *         description: 서버 오류
 */
router.get('/count', async (req, res) => {
    try {
        const totalCount = await Object_get.countDocuments({});
        res.json({ totalCount: Math.ceil(totalCount / 10) });
    } catch (err) {
        console.error('게시글 수 조회 오류:', err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router