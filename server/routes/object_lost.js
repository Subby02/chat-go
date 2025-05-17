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
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 목록에서 넘어온 페이지 번호
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
 *         description: 게시 시작 날짜
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 종료 날짜
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 시작 일자
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 종료 일자
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
 *         description: 게시글 상세 정보 및 검색 조건 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   properties:
 *                     lstPrdtNm:
 *                       type: string
 *                       example: 지갑
 *                     lstYmd:
 *                       type: string
 *                       example: "2025-05-01 14:30"
 *                     lstPlace:
 *                       type: string
 *                       example: 서울역 2층 대합실
 *                     prdtClNm:
 *                       type: string
 *                       example: 전자기기
 *                     lstSteNm:
 *                       type: string
 *                       example: 보관 중
 *                     lstLctNm:
 *                       type: string
 *                       example: 서울특별시
 *                     si:
 *                       type: string
 *                       example: 서울특별시
 *                     sgg:
 *                       type: string
 *                       example: 강남구
 *                     emd:
 *                       type: string
 *                       example: 역삼동
 *                     uniq:
 *                       type: string
 *                       example: 검정색 가죽지갑, 로고 있음
 *                     lstSbjt:
 *                       type: string
 *                       example: 지갑을 잃어버렸습니다
 *                     orgNm:
 *                       type: string
 *                       example: 서울역 분실물 센터
 *                     tel:
 *                       type: string
 *                       example: 02-1234-5678
 *                     orgId:
 *                       type: string
 *                       example: ORG001
 *                     lstPlaceSeNm:
 *                       type: string
 *                       example: 역사 내부
 *                     atcId:
 *                       type: string
 *                       example: ATC123456
 *                     user_id:
 *                       type: string
 *                       example: user@example.com
 *                     date:
 *                       type: string
 *                       example: "2025-05-15 15:30"
 *                     lstFilePathImg:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                 query:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: string
 *                       example: "1"
 *                     search:
 *                       type: string
 *                       example: 지갑
 *                     dateStart:
 *                       type: string
 *                       example: "2025-05-01"
 *                     dateEnd:
 *                       type: string
 *                       example: "2025-05-17"
 *                     lstYmdStart:
 *                       type: string
 *                       example: "2025-05-01"
 *                     lstYmdEnd:
 *                       type: string
 *                       example: "2025-05-10"
 *                     si:
 *                       type: string
 *                       example: 서울특별시
 *                     sgg:
 *                       type: string
 *                       example: 강남구
 *                     emd:
 *                       type: string
 *                       example: 역삼동
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

        // 날짜 포맷 처리: date
        if (obj.date instanceof Date) {
            const kst = new Date(obj.date.getTime() + 9 * 60 * 60 * 1000);
            const iso = kst.toISOString();
            const [datePart, timePart] = iso.split('T');
            const time = timePart.slice(0, 5);
            obj.date = `${datePart} ${time}`;
        }

        // 날짜 포맷 처리: lstYmd (+ lstHor)
        if (obj.lstYmd instanceof Date) {
            const kstLstYmd = new Date(obj.lstYmd.getTime() + 9 * 60 * 60 * 1000);
            const ymd = kstLstYmd.toISOString().slice(0, 10);
            obj.lstYmd = obj.lstHor ? `${ymd} ${obj.lstHor}` : ymd;
        }

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
 *                 type: Date
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
            user_id: req.user.email,
            date: date ? new Date(date) : new Date(),
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
        res.json({ totalCount: Math.ceil(totalCount / show_list) });
    } catch (err) {
        console.error('게시글 수 조회 오류:', err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});


// 검색기능 및 목록
/**
 * @swagger
 * /api/object/lost/search:
 *   get:
 *     summary: 분실물 게시글 검색 및 목록 조회
 *     tags: [ObjectLost]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 통합 검색어 (물품명, 장소, 제목 등)
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 시작 날짜
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 게시 종료 날짜
 *       - in: query
 *         name: lstYmdStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 시작 일자
 *       - in: query
 *         name: lstYmdEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 분실 종료 일자
 *       - in: query
 *         name: si
 *         schema:
 *           type: string
 *           example: 서울특별시
 *         description: 시/도
 *       - in: query
 *         name: sgg
 *         schema:
 *           type: string
 *           example: 강남구
 *         description: 시군구
 *       - in: query
 *         name: emd
 *         schema:
 *           type: string
 *           example: 역삼동
 *         description: 읍면동
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 요청할 페이지 번호 (1부터 시작)
 *     responses:
 *       200:
 *         description: 게시글 목록과 페이지 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                   description: 전체 페이지 수 (show_list 기준으로 나눈 값)
 *                 results:
 *                   type: array
 *                   description: 게시글 목록 (페이지당 최대 10개)
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6650d376e8237b07dcd5461b"
 *                       lstPrdtNm:
 *                         type: string
 *                         example: 지갑
 *                       lstPlace:
 *                         type: string
 *                         example: 서울역 2층 대합실
 *                       prdtClNm:
 *                         type: string
 *                         example: 전자기기
 *                       lstSteNm:
 *                         type: string
 *                         example: 보관 중
 *                       lstLctNm:
 *                         type: string
 *                         example: 서울특별시
 *                       lstSbjt:
 *                         type: string
 *                         example: 지갑을 찾습니다
 *                       date:
 *                         type: string
 *                         example: "2025-05-16"
 *                       lstFilePathImg:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       500:
 *         description: 서버 오류
 */
router.get('/search', async (req, res) => {
    const {
        search,
        dateStart,
        dateEnd,
        lstYmdStart,
        lstYmdEnd,
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
                    { lstPrdtNm: regex },
                    { lstPlace: regex },
                    { prdtClNm: regex },
                    { uniq: regex },
                    { lstSbjt: regex },
                    { lstPlaceSeNm: regex }
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

    // si / sgg / emd는 개별 검색 (정확 일치)
    if (si) andConditions.push({ si: { $regex: si, $options: 'i' } });
    if (sgg) andConditions.push({ sgg: { $regex: sgg, $options: 'i' } });
    if (emd) andConditions.push({ emd: { $regex: emd, $options: 'i' } });

    const finalQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    try {
        const skip = (parseInt(page) - 1) * parseInt(show_list);
        const limit = parseInt(show_list);

        const docs = await Object_lost.find(finalQuery).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalCount = await Object_lost.countDocuments(finalQuery);

        const results = docs.map(doc => {
            const obj = doc.toObject();
            obj.date = obj.date ? new Date(obj.date).toISOString().slice(0, 10) : null;
            return obj;
        });

        res.json({
            totalPages: Math.ceil(totalCount / parseInt(show_list)),
            results
        });
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router