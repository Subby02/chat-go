const router = require('express').Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
const { User } = require('../models/user');

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

router.post('/login', async (req, res, next) => {
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

router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, name: req.user.name });
    } else {
      res.json({ authenticated: false });
    }
})

router.post('/logout', async (req, res, next) => {
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