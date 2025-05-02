const mongoose = require('mongoose');

const animalGetSchema = mongoose.Schema({
    happenDt: { type: String },
    happenPlace: { type: String },
    kindCd: { type: String },
    colorCd: { type: String },
    sexCd: { type: String },
    age: { type: String },
    weight: { type: String },
    noticeNo: { type: String },
    noticeSdt: { type: String },
    noticeEdt: { type: String },
    processState: { type: String },
    neuterYn: { type: String },
    careNm: { type: String },
    careTel: { type: String },
    careAddr: { type: String },
    orgNm: { type: String },
    popfile: { type: String }
  }, {
    versionKey: false
  });

  const AnimalGet = mongoose.model('AnimalGet', animalGetSchema, 'animal_get');

  module.exports = { AnimalGet }