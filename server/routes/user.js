const router = require('express').Router()
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const coolsms = require('coolsms-node-sdk').default
const { User } = require('../models/user')
const { AuthCode } = require('../models/authCodes')
const { Object_lost } = require('../models/object_lost.js');
const { Object_get } = require('../models/object_get.js');
const { Animal_lost } = require('../models/AnimalGet.js');
const { Animal_get } = require('../models/AnimalLost.js');
const { Reward_animal } = require('../models/reward_animal.js');
const { Reward_object } = require('../models/reward_object.js');


function generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const MYPAGE_MAX_POST = 10;

const messageService = new coolsms(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, cb) => {
    try {
        // 1. 아이디가 비어있는지 체크
        if (!email || !password) {
            return cb(null, false, { message: '이메일과 비밀번호는 필수입니다.' });
        }

        // 2. 아이디가 DB에 존재하는지 확인
        let result = await User.findOne({ email: email });
        if (!result) {
            return cb(null, false, { message: '이메일이 존재하지 않습니다.' });
        }

        // 3. 비밀번호 확인
        const isMatch = await bcrypt.compare(password, result.password);
        if (!isMatch) {
            return cb(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
        // 로그인 성공: 사용자의 정보를 넘김
        return cb(null, result);
    } catch (error) {
        console.error(error);
        return cb(error);
    }
}));

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, email: user.email })
    })
})

passport.deserializeUser(async (user, done) => {
    let result = await User.findOne({ _id: new ObjectId(user.id) })
    result = result.toObject()
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
})

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: "회원가입"
 *     description: "이 API는 사용자가 이메일, 전화번호 인증 후 회원가입을 진행하는 기능을 제공합니다."
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "사용자 이메일"
 *                 example: "example@domain.com"
 *               password:
 *                 type: string
 *                 description: "사용자 비밀번호"
 *                 example: "password123"
 *               phone_number:
 *                 type: string
 *                 description: "사용자 전화번호"
 *                 example: "01012345678"
 *               name:
 *                 type: string
 *                 description: "사용자 이름"
 *                 example: "홍길동"
 *     responses:
 *       200:
 *         description: "회원가입 성공, 로그인 페이지로 리디렉션"
 *         headers:
 *           Location:
 *             type: string
 *             description: "리디렉션된 페이지 URL"
 *             example: "/login"
 *       401:
 *         description: "이메일 중복"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "메일 중복"
 *       402:
 *         description: "전화번호 중복"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "전화번호 중복"
 *       403:
 *         description: "전화번호 인증 만료 또는 존재하지 않음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "전화번호 인증이 만료되었거나 존재하지 않습니다."
 *       500:
 *         description: "세션 종료 중 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "세션 종료 중 오류 발생"
 */
router.post('/register', async (req, res) => {
    if(!req.isAuthenticated()){
        const sessionData = req.session.phoneVerified;
        const emailExists = await User.exists({ email : req.body.email });
        const phoneExists = await User.exists({ phone_number : req.body.phone_number });

        if(!!emailExists){
            return res.status(401).json({ message: '메일 중복' });
        }

        if(!!phoneExists){
            return res.status(402).json({ message: '전화번호 중복' });
        }

        if (!sessionData || Date.now() > sessionData.expiresAt) {
            return res.status(403).json({ message: '전화번호 인증이 만료되었거나 존재하지 않습니다.' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('세션 종료 중 오류 발생', err);
                return res.status(500).json({ message: '세션 종료 중 오류 발생' });
            }

            res.clearCookie('connect.sid'); 
        });
        const user = new User(req.body)

        try {
            await user.save();
            return res.status(200).json({ message: '회원가입 성공' });
        } catch (err) {
            return res.json({ message: err.message });
        }

    }
})

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 로그인
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email        # 필수 항목
 *               - password     # 필수 항목
 *             properties:
 *               email:
 *                 type: string
 *                 description: 로그인에 사용될 이메일
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: 로그인에 사용될 비밀번호
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: 홈 페이지로 리디렉션됨
 *       401:
 *         description: 로그인 실패 (잘못된 이메일 또는 비밀번호)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 잘못된 이메일 또는 비밀번호입니다.
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버 오류 발생
 */
router.post('/login', (req, res, next) => {
    if (!req.isAuthenticated()) {
        passport.authenticate('local', (error, user, info) => {
            if (error) return res.status(500).json(error)
            if (!user) return res.status(401).json(info)
            req.logIn(user, (err) => {
                if (err) return next(err)
                res.redirect('/')
            })
        })(req, res, next)
    }
})

/**
 * @swagger
 * /api/check-email:
 *   get:
 *     summary: 이메일 중복 확인
 *     tags: [user]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: user@example.com
 *         description: 중복 확인할 이메일 주소
 *     responses:
 *       200:
 *         description: 이메일 중복 여부 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: 이메일이 이미 존재하는지 여부
 *                   example: true
 *       401:
 *         description: 이메일이 제공되지 않은 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 이메일이 필요합니다.
 */
router.get('/check-email', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(401).json({ message: '이메일이 필요합니다.' });

    const exists = await User.exists({ email });
    return res.json({ exists: !!exists });
})

/**
 * @swagger
 * /api/send-code:
 *   post:
 *     summary: 인증 코드 전송
 *     tags: [user]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *           example: "010-1234-5678"
 *         description: 인증 코드를 발송할 전화번호
 *     responses:
 *       200:
 *         description: 인증 코드 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증번호가 발송되었습니다."
 *       401:
 *         description: 이미 인증 코드가 발송된 전화번호
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 전화번호에 대한 인증 코드가 이미 존재합니다."
 *       500:
 *         description: 서버 오류 (인증 코드 발송 중)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증 번호 발송 중 오류가 발생했습니다."
 */
router.post('/send-code', async (req, res) => {
    const { phone_number: to } = req.query;

    // 이미 인증 코드가 존재하는지 확인
    const existingAuthCode = await AuthCode.findOne({ phoneNumber: to });

    if (existingAuthCode) {
        return res.status(401).json({
            message: '해당 전화번호에 대한 인증 코드가 이미 존재합니다.',
        });
    }

    const code = generateAuthCode();
    const authCode = new AuthCode({
        phoneNumber: to,
        code: code
    });

    try {
        // 인증 코드 저장
        await authCode.save();

        // 메시지 전송
        await messageService.sendOne({
            to: to,
            from: process.env.SMS_FROM,
            text: `ChatGO 인증번호는 [${code}] 입니다.`,
        });

        return res.status(200).json({ message: '인증번호가 발송되었습니다.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '인증 번호 발송 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /api/verify-code:
 *   post:
 *     summary: 인증 코드 검증
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - code
 *             properties:
 *               to:
 *                 type: string
 *                 description: 인증 코드를 검증할 전화번호
 *                 example: "010-1234-5678"
 *               code:
 *                 type: string
 *                 description: 사용자가 입력한 인증 코드
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "인증 성공!"
 *       401:
 *         description: 인증 코드 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증 코드가 존재하지 않거나 만료되었습니다."
 *       402:
 *         description: 인증 코드 불일치
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증 코드가 일치하지 않습니다."
 *       500:
 *         description: 서버 오류 (인증 코드 검증 중)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증 코드 검증 중 오류가 발생했습니다."
 */
router.post('/verify-code', async (req, res) => {
    const { to, code } = req.body;

    try {
        // 최신 인증 코드 찾기
        const authCode = await AuthCode.findOne({ phoneNumber: to }).sort({ createdAt: -1 });

        // 인증 코드가 존재하지 않거나 만료된 경우
        if (!authCode) {
            return res.status(401).json({ verified: false, message: '인증 코드가 존재하지 않거나 만료되었습니다.' });
        }

        // 인증 코드가 일치하지 않는 경우
        if (authCode.code !== code) {
            return res.status(402).json({ verified: false, message: '인증 코드가 일치하지 않습니다.' });
        }

         req.session.phoneVerified = {
            phone_number: to,
            expiresAt: Date.now() + 5 * 60 * 1000  // 5분 유효
        };

        // 인증 코드 삭제
        await AuthCode.deleteOne({ phoneNumber: to });

        return res.status(200).json({ verified: true, message: '인증 성공!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ verified: false, message: '인증 코드 검증 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: 현재 인증 상태 확인
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 인증 상태 응답
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 name:
 *                   type: string
 *                   example: "홍길동"
 *       401:
 *         description: 인증되지 않은 상태
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   example: false
 */
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, name: req.user.name });
    } else {
        res.json({ authenticated: false });
    }
})

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         description: 인증되지 않은 상태로 로그아웃 시도
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인하지 않은 사용자입니다."
 */
router.post('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) return next(err);

            req.session.destroy((err) => {
                if (err) return next(err);

                res.clearCookie('connect.sid');
                res.redirect('/');
            });
        });
    } else {
        res.redirect('/');
    }
})

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: "비밀번호 재설정"
 *     description: "전화번호 인증을 완료한 후 비밀번호를 재설정하는 기능을 제공합니다."
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: "새로운 비밀번호"
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: "비밀번호 변경 성공, 로그인 페이지로 리디렉션"
 *         headers:
 *           Location:
 *             type: string
 *             description: "리디렉션된 페이지 URL"
 *             example: "/login"
 *       401:
 *         description: "전화번호 인증 만료 또는 존재하지 않음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "전화번호 인증이 만료되었거나 존재하지 않습니다."
 *       402:
 *         description: "해당 전화번호로 등록된 사용자가 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "해당 전화번호로 등록된 사용자가 없습니다."
 *       500:
 *         description: "비밀번호 변경 중 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호 변경 중 오류가 발생했습니다."
 */
router.post('/reset-password', async (req, res) => {
    const { password } = req.body;
    const sessionData = req.session.phoneVerified;

    if (!sessionData || Date.now() > sessionData.expiresAt) {
        return res.status(401).json({ message: '전화번호 인증이 만료되었거나 존재하지 않습니다.' });
    }

    try {
        const user = await User.findOne({ phone_number: sessionData.phone_number });
        if (!user) {
            return res.status(402).json({ message: '해당 전화번호로 등록된 사용자가 없습니다.' });
        }

        user.password = password; 
        await user.save();    

        req.session.destroy((err) => {
            if (err) {
                console.error('세션 종료 중 오류 발생', err);
                return res.status(500).json({ message: '세션 종료 중 오류 발생' });
            }

            res.clearCookie('connect.sid');  // 세션 쿠키 삭제
            return res.redirect('/login'); // 로그인 페이지로 리디렉션
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
    }
});


router.get('/user/info', (req, res) => {
    if (req.isAuthenticated()) {
        let result = req.user
        delete result.role
        delete result._id
        res.json(result);
    } else {
        res.status(401).json({ message: '로그인이 필요합니다' });
    }
})

router.get('/user/posts', async (req, res) => {
    if (req.isAuthenticated()) {
        const {
            page = 1,
        } = req.query;

        try {
        const skip = (parseInt(page) - 1) * MYPAGE_MAX_POST;
        const limit = MYPAGE_MAX_POST;

        const docs = await Object_lost.find({ user_id: req.user._id }).sort({ _id: -1 }).skip(skip).limit(limit);

        const totalCount = await Object_lost.countDocuments({ user_id: req.user._id });

        const results = docs.map(doc => {
            const obj = doc.toObject();
            obj.date = obj.date ? new Date(obj.date).toISOString().slice(0, 10) : null;
            return obj;
        });

        res.json({
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / MYPAGE_MAX_POST),
            totalCount,
            results
        });
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(501).json({ message: err.message });
    }
    } else {
        res.status(401).json({ message: '로그인이 필요합니다' });
    }
})

module.exports = router