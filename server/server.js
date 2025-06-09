const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')
const session = require('express-session')
const passport = require('passport')
const methodOverride = require('method-override');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron');
// const { update } = require('./dataLoader.js');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:5173',  // React 앱 주소
  credentials: true                // ✅ 세션 쿠키 허용
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use(methodOverride('_method'));

app.use(passport.initialize())
app.use(session({
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
app.use(passport.session())

mongoose.connect(process.env.DB_URL)
  .then(() => console.log('몽고DB Connected...'))
  .catch(err => console.log('몽고디비 에러', err))

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChatGO',
      version: '1.0.0',
      description: 'ChatGO Swagger 문서',
    }
  },
  apis: ['./routes/*.js'], // 또는 현재 파일이면 ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', require('./routes/user.js'))
app.use('/api', require('./routes/home.js')) //메인 화면
app.use('/api/animal/get', require('./routes/animalGet.js'));     // 보호 동물 라우터
app.use('/api/animal/lost', require('./routes/animalLost.js'));    // 유실 동물 라우터
app.use('/api/object/get', require('./routes/objectGet.js'))
app.use('/api/object/lost', require('./routes/objectLost.js'))
app.use('/api/reward/animal', require('./routes/rewardAnimal.js'))
app.use('/api/reward/object', require('./routes/rewardObject.js'))
app.use('/api/images', express.static(path.join(__dirname, './images')));

app.get('/', (req, res) => {
  res.send("Hello World");
})



app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
})

// cron.schedule('56 16 * * *', async () => {    // 정각 00시 자동 업데이트
//   await update();
// });

