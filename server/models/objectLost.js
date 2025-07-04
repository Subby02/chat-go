const mongoose = require('mongoose');

//분실물 신고 게시판 (Object_lost)
const object_lost_schema = mongoose.Schema({
    id: { type: String },
    user_id: { type: String },
    date: { type: Date },
    atcId: { type: String },
    lstPrdtNm: { type: String },
    lstYmd: { type: Date },
    lstHor: { type: String },
    lstPlace: { type: String },
    si: { type: String },
    sgg: { type: String },
    emd: { type: String },
    prdtClNm: { type: String },
    lstSteNm: { type: String },
    uniq: { type: String },
    lstLctNm: { type: String },
    lstSbjt: { type: String },
    orgId: { type: String },
    orgNm: { type: String },
    tel: { type: String },
    lstPlaceSeNm: { type: String },
    lstFilePathImg: { type: String }
}, { versionKey: false });

const ObjectLost = mongoose.model('Object_lost', object_lost_schema, 'object_lost');

module.exports = { ObjectLost };