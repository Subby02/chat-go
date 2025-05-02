const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

mongoose.connect(process.env.DB_URL)
.then( ()=>console.log('몽고DB Connected...'))
.catch(err=>console.log('몽고디비 에러',err))

app.use('/', require('./routes/user.js'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT}`);
})