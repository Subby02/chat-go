const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const coolsms = require('coolsms-node-sdk').default;
const { User } = require('../models/user');
const { AuthCode } = require('../models/authCodes');

function generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const messageService = new coolsms(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);

router.use(passport.initialize())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: process.env.DB_NAME,
    })
}))
router.use(passport.session())

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
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
})

/**
 * @swagger
 * /register:
 *   post:
 *     summary: 회원가입
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 회원가입 성공
 */
router.post('/register', async (req, res) => {
    if(!req.isAuthenticated()){
        const user = new User(req.body)

        try {
            await user.save();
            return res.redirect('/login');
        } catch (err) {
            return res.json({ message: err.message });
        }
    
    }
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 로그인
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 로그인 성공
 */
router.post('/login', (req, res, next) => {
    if(!req.isAuthenticated()){
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
 * /check-email:
 *   get:
 *     summary: 이메일 확인
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 이메일 확인 성공
 */
router.get('/check-email', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: '이메일이 필요합니다.' });

    const exists = await User.exists({ email });
    return res.json({ exists: !!exists });
})


/**
 * @swagger
 * /send-code:
 *   post:
 *     summary: 인증 코드 발송
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 인증 코드 발송 성공
 */
router.post('/send-code', async (req, res) => {
    const { phone_number: to } = req.query;

    // 이미 인증 코드가 존재하는지 확인
    const existingAuthCode = await AuthCode.findOne({ phoneNumber: to });

    if (existingAuthCode) {
        return res.status(400).json({
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
 * /verify-code:
 *   post:
 *     summary: 인증 번호 확인
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 인증 번호 확인 성공
 */
router.post('/verify-code', async (req, res) => {
    const { to, code } = req.body;

    try {
        // 최신 인증 코드 찾기
        const authCode = await AuthCode.findOne({ phoneNumber: to }).sort({ createdAt: -1 });

        // 인증 코드가 존재하지 않거나 만료된 경우
        if (!authCode) {
            return res.status(400).json({ verified: false, message: '인증 코드가 존재하지 않거나 만료되었습니다.' });
        }

        // 인증 코드가 일치하지 않는 경우
        if (authCode.code !== code) {
            return res.status(400).json({ verified: false, message: '인증 코드가 일치하지 않습니다.' });
        }

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
 * /status:
 *   get:
 *     summary: 로그인 상태
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 로그인 상태 반환
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
 * /logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [user]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
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


module.exports = router