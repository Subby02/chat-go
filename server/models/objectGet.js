const mongoose = require('mongoose');

// 분실물 습득 게시판 (Object_get)
const object_get_schema = mongoose.Schema({
    user_id: { type: String },
    date: { type: Date },
    atcId: { type: String },
    fdPrdtNm: { type: String },
    fdYmd: { type: Date },
    si: { type: String },
    sgg: { type: String },
    emd: { type: String },
    fdSn: { type: String },
    prdtClNm: { type: String },
    depPlace: { type: String },
    clrNm: { type: String },
    fdsbjt: {type: String},
    fdFilePathImg: { type: String }
}, { versionKey: false });

const ObjectGet = mongoose.model('Object_get', object_get_schema, 'object_get');

module.exports = { ObjectGet };
