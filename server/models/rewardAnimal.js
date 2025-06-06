const mongoose = require('mongoose');

const reward_animal_schema = mongoose.Schema({
    user_id: { type: String }, // 유저 아이디
    date: { type: Date }, // 게시 날짜
    callName: { type: String }, // 보호자 이름
    callTel: { type: String }, // 보호자 연락처
    rfidCd: { type: String }, // 칩
    happenDt: { type: String }, // 유기 날짜
    happenAddr: { type: String }, // 유기 주소
    happenPlace: { type: String },  //주위 건물
    si: { type: String }, // 광역시
    sgg: { type: String }, // 시군구
    emd: { type: String }, // 읍면동
    popfile: { type: String }, // 이미지
    kindCd: { type: String }, // 품종
    sexCd: { type: String }, // 성별
    age: { type: Number }, // 나이
    specialMark: { type: String }, // 특이사항
    reward: { type: Number } // 보상금
}, { versionKey: false });

const RewardAnimal = mongoose.model('Reward_animal', reward_animal_schema, 'reward_animal');

module.exports = { RewardAnimal };
