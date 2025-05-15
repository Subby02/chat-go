const mongoose = require('mongoose');

const reward_animal_schema = mongoose.Schema({
    user_id: { type: String },
    date: { type: Date },
    callName: { type: String },
    callTel: { type: String },
    happenDt: { type: String },
    happenAddr: { type: String },
    happenAddrDtl: { type: String },
    happenPlace: { type: String },
    si: { type: String },
    sgg: { type: String },
    emd: { type: String },
    popfile: { type: String },
    kindCd: { type: String },
    sexCd: { type: String, enum: ['M', 'F'] },
    age: { type: String },
    specialMark: { type: String },
    reward: { type: String }
}, { versionKey: false });

const Reward_animal = mongoose.model('Reward_animal', reward_animal_schema, 'reward_animal');

module.exports = { Reward_animal };
