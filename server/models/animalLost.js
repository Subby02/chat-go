const mongoose = require('mongoose');

const animalLostSchema = mongoose.Schema({
  user_id: { type: String },
  date: { type: Date },
  desertionNo:{ type: String}, 
  rfidCd: { type: String },
  callName: { type: String },
  callTel: { type: String },
  happenDt: { type: Date }, 
  happenAddr: { type: String },
  happenAddrDtl: { type: String},
  happenPlace: { type: String },
  si: { type: String },
  sgg: { type: String },
  emd: { type: String },
  orgNm: { type: String },
  popfile: { type: String },  // 이미지 URL
  kindCd: { type: String },
  sexCd: { type: String },
  age: { type: String },
  specialMark: { type: String }
}, {
  versionKey: false
});

const AnimalLost = mongoose.model('AnimalLost', animalLostSchema, 'animal_lost');

module.exports = { AnimalLost }
