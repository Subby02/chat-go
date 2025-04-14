const express = require('express');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt') 
const { MongoClient, ObjectId } = require('mongodb')
const MongoStore = require('connect-mongo')
const path = require('path');
require('dotenv').config() 

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

let db
const url = process.env.DB_URL
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('CP')
}).catch((err)=>{
  console.log(err)
})

app.use(passport.initialize())
app.use(session({
  secret: 'testsecret',
  resave : false,
  saveUninitialized : false,
  cookie : { 
    maxAge : 60 * 60 * 1000
  },
  store: MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName: 'CP',
  })
}))
app.use(passport.session()) 

passport.use(new LocalStrategy(async (id, password, cb) => {
  try {
    // 1. 아이디가 비어있는지 체크
    if (!id || !password) {
      return cb(null, false, { message: '아이디와 비밀번호는 필수입니다.' });
    }

    // 2. 아이디가 DB에 존재하는지 확인
    let result = await db.collection('user').findOne({ user_id: id });
    if (!result) {
      return cb(null, false, { message: '아이디가 존재하지 않습니다.' });
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
    done(null, { id: user._id, username: user.user_id })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password
  process.nextTick(() => {
      return done(null, result)
  })
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
  })
) 

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 1. 필수 값 체크
  if (!username || !password) {
    return res.status(400).json({ message : '아이디와 비밀번호는 필수입니다.'});
  }

  // 2. 아이디 길이 체크 (예: 4자 이상)
  if (username.length < 4) {
    return res.status(400).json({ message : '아이디는 최소 4자 이상이어야 합니다.'});
  }

  // 3. 비밀번호 길이 체크 (예: 6자 이상)
  if (password.length < 6) {
    return res.status(400).json({ message : '비밀번호는 최소 6자 이상이어야 합니다.'});
  }

  // 4. 아이디 중복 체크
  let existingUser = await db.collection('user').findOne({ user_id: username });
  if (existingUser) {
    return res.status(400).json({ message : '이미 사용 중인 아이디입니다.'});
  }

  // 5. 비밀번호 해싱
  let hash = await bcrypt.hash(password, 10);

  // 6. 사용자 정보 DB에 저장
  await db.collection('user').insertOne({
    user_id: username,
    password: hash
  });

  // 7. 회원가입 후 로그인 페이지로 리디렉션
  res.redirect('/login');
})

app.get('/',(req,res)=>{
  res.send("hello");
})
 
app.listen(PORT,()=>{
  console.log(`server running on PORT ${PORT}`);
})