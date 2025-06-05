const mongoose = require('mongoose');

const animalGetSchema = mongoose.Schema({
  user_id: { type: String},
  date: { type: Date},
  desertionNo: { type: String},
  rfidCd: { type: String },
  happenDt: { type: String },
  happenPlace: { type: String },
  si: { type: String },
  sgg: { type: String },
  emd: { type: String },
  kindNm: { type: String },
  colorCd: { type: String },
  age: { type: String },
  weight: { type: String },
  noticeNo: { type: String },
  noticeSdt: { type: String },
  noticeEdt: { type: String },
  popfile1: { type: String },
  processState: { type: String },
  sexCd: { type: String },
  neuterYn: { type: String },
  specialMark: { type: String },
  careRegNo: { type: String },
  careNm: { type: String },
  careTel: { type: String },
  careAddr: { type: String },
  careOwnerNm: { type: String },
  orgNm: { type: String },
}, {
  versionKey: false
});

const AnimalGet = mongoose.model('AnimalGet', animalGetSchema, 'animal_get');

module.exports = { AnimalGet }
