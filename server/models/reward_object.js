const mongoose = require('mongoose');

const reward_object_schema = mongoose.Schema({
    user_id: { type: String },
    date: { type: Date },
    lstPrdtNm: { type: String },
    lstYmd: { type: String },
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
    lstPlaceSeNm: { type: String },
    lstFilePathImg: { type: String },
    reward: { type: String }
}, { versionKey: false });

const Reward_object = mongoose.model('Reward_object', reward_object_schema, 'reward_object');

module.exports = { Reward_object };
