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

router.get('/register', (req, res) => {
    if(!req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
    }else{
        res.redirect('/')
    }
});

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

router.get('/login', (req, res) => {
    if(!req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    }else{
        res.redirect('/')
    }
});

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

router.get('/check-email', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: '이메일이 필요합니다.' });

    const exists = await User.exists({ email });
    return res.json({ exists: !!exists });
})

router.post('/send-code', async (req, res) => {
    const to = req.query.phone_number;

    let exists = await AuthCode.exists({});
    
    if(exists){
        exists = await AuthCode.exists({ phoneNumber: to });

        if (exists) {
            return res.status(404).json({
                message: '해당 전화번호에 대한 인증 코드가 존재',
            });
        }   
    }

    const code = generateAuthCode();

    const authCode = new AuthCode({
        phoneNumber: to,
        code: code,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3분 후 만료
    });
    
    const saved = await authCode.save();

    messageService.sendOne({
        to: to,
        from: process.env.SMS_FROM,
        text: 'ChatGO 인증번호는 [' + code + '] 입니다.',
    }).catch(err => console.error(err));

    res.status(200).json({ message: '인증 메일 발송'});
})

router.post('/verify-code', async (req, res) => {
    const { to , code } = req.body;

    const authCode = await AuthCode.findOne({ phoneNumber : to }).sort({ createdAt: -1 });
    
    if (!authCode) {
        return res.status(400).json({ verified: false, message: '인증 코드가 존재하지 않거나 만료되었습니다.' });
    }

    if (authCode.code !== code) {
        return res.status(400).json({ verified: false, message: '인증 코드가 일치하지 않습니다.' });
    }

    await AuthCode.deleteOne({ phoneNumber: to });

    res.status(200).json({ verified: true, message: '인증 성공!' });
})

router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, name: req.user.name });
    } else {
      res.json({ authenticated: false });
    }
})

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