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
const { RewardObject } = require('../models/rewardObject');
const multer = require('multer');
const fs = require('fs');

/**
 * @swagger
 * /api/slider-posts:
 *   get:
 *     summary: 메인 화면 슬라이더용 최신 보상 게시글 조회
 *     description: 최신 보상 물건 및 보상 동물 게시글을 각각 6개씩 조회하여 날짜 기준으로 정렬한 목록을 반환합니다.
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: 최신 게시글 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sliderPosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [object, animal]
 *                         description: 게시글 종류 (보상 물건 또는 보상 동물)
 *                         example: "object"
 *                       id:
 *                         type: string
 *                         description: MongoDB ObjectId
 *                         example: "6650d376e8237b07dcd5461b"
 *                       kind:
 *                         type: string
 *                         description: 물품명 또는 동물 품종
 *                         example: "지갑"
 *                       date:
 *                         type: string
 *                         description: 분실일 또는 발생일
 *                         example: "2025-06-01"
 *                       location:
 *                         type: string
 *                         description: 지역 정보 (시)
 *                         example: "서울특별시"
 *                       reward:
 *                         type: integer
 *                         description: 현상금
 *                         example: 100000
 *                       image:
 *                         type: string
 *                         description: 이미지 경로 또는 URL
 *                         example: "/api/images/reward_object/1685871234567-wallet.jpg"
 *       500:
 *         description: 서버 오류 발생
 */
router.get('/slider-posts', async (req, res) => {
    try {
        const latestObjects = await RewardObject.find().sort({ date: -1 }).limit(6);
        const latestAnimals = await RewardAnimal.find().sort({ date: -1 }).limit(6);

        const formatDate = (rawDate) => {
            return new Date(rawDate).toISOString().slice(0, 10); // "2025-06-03"
        };

        // 공통 포맷으로 변환
        const formattedObjects = latestObjects.map(obj => ({
            type: 'object',
            id: obj._id.toString(), //몽고디비 아이디
            kind: obj.prdtClNm, // 물품명
            date: formatDate(obj.lstYmd), // 분실 날짜
            location: obj.si, // 광역시
            image: obj.lstFilePathImg, //이미지
            reward: obj.reward //현상금금
        }));

        const formattedAnimals = latestAnimals.map(animal => ({
            type: 'animal',
            id: animal._id.toString(), //몽고디비 아이디
            kind: animal.kindCd, // 품종
            date: formatDate(animal.happenDt), //분실 날짜
            location: animal.si, // 광역역시
            image: animal.popfile, //이미지
            reward: animal.reward //현상금
        }));

        // 하나의 배열로 병합 후 날짜 기준 정렬
        const combined = [...formattedObjects, ...formattedAnimals].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        res.status(200).json({
            success: true,
            sliderPosts: combined
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router