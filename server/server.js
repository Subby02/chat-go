const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use(methodOverride('_method'));

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('몽고DB Connected...'))
    .catch(err => console.log('몽고디비 에러', err))

app.use('/', require('./routes/user.js'))
app.use('/', require('./routes/object_get.js'))
app.use('/', require('./routes/object_lost.js'))
app.use('/', require('./routes/reward_object.js'))
app.use('/', require('./routes/reward_animal.js'))

//글 작성하기
app.get('/object/get/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'get', 'write.html'));
});

app.get('/object/lost/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'lost', 'write.html'));
});

app.get('/reward/animal/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'animal', 'write.html'));
});

app.get('/reward/object/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'object', 'write.html'));
});

//글 수정하기
app.get('/object/get/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'get', 'edit.html'));
})

app.get('/object/lost/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'lost', 'edit.html'));
})

app.get('/reward/object/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'object', 'edit.html'));
})

app.get('/reward/animal/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'animal', 'edit.html'));
})

//리스트 보여주기
app.get('/object/get/:num', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'get', 'list.html'));
});

app.get('/object/lost/:num', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'lost', 'list.html'));
});

app.get('/reward/animal/:num', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'animal', 'list.html'));
});

app.get('/reward/object/:num', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'object', 'list.html'));
});

//해당하는 글 들어가기
app.get('/object/get/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'get', 'detail.html'));
})

app.get('/object/lost/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'object', 'lost', 'detail.html'));
})

app.get('/reward/animal/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'animal', 'detail.html'));
});

app.get('/reward/object/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reward', 'object', 'detail.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT}`);
})