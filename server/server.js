const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')
const session = require('express-session')
const passport = require('passport')
const methodOverride = require('method-override');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;

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
    },
    tags: [
      {
        name: 'user',
        description: '회원가입, 로그인 등 사용자 관련 API',
      }
    ],
  },
  apis: ['./routes/*.js'], // 또는 현재 파일이면 ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/', require('./routes/view.js'))
app.use('/api', require('./routes/user.js'))
app.use('/api/animal', require('./routes/animal_get.js'));     // 보호 동물 라우터
app.use('/api/animal', require('./routes/animal_lost.js'));    // 유실 동물 라우터
app.use('/api/object/get', require('./routes/object_get.js'))
app.use('/api/object/lost', require('./routes/object_lost.js'))
app.use('/api/reward/animal', require('./routes/reward_animal.js'))
app.use('/api/reward/object', require('./routes/reward_object.js'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT}`);
})