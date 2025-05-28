const mongoose = require('mongoose');

const animalLostSchema = mongoose.Schema({
    user_id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    rfidCd: { type: String },
    callName: { type: String },
    callTel: { type: String },
    happenDt: { type: String },  // 공공 API는 문자열일 가능성 있음
    happenAddr: { type: String, required: true },
    si: { type: String },
    sgg: { type: String },
    emd: { type: String },
    happenPlace: { type: String },
    orgNm: { type: String },
    popfile: { type: String },  // 이미지 URL
    kindCd: { type: String, required: true },
    sexCd: { type: String },
    age: { type: String },
    specialMark: { type: String }
  }, {
    versionKey: false
  });

const AnimalLost = mongoose.model('AnimalLost', animalLostSchema, 'animal_lost');

module.exports = { AnimalLost }