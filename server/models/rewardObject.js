const mongoose = require('mongoose');

const reward_object_schema = mongoose.Schema({
    id: { type: String }, //아이디
    user_id: { type: String }, //유저 아이디
    date: { type: Date }, // 게시날짜
    lstPrdtNm: { type: String }, //물품명
    lstYmd: { type: String }, //분실 일시
    lstHor: { type: String }, //분실 시간
    lstPlace: { type: String }, // 분실 장소
    si: { type: String }, // 지역
    sgg: { type: String }, // 지역
    emd: { type: String }, // 지역
    prdtClNm: { type: String }, //불품 분류
    uniq: { type: String }, //특이사항
    lstLctNm: { type: String }, // 분실 지역
    lstSbjt: { type: String }, //게시 제목(내용)
    lstFilePathImg: { type: String }, //파일경로로
    reward: { type: Number } //보상금
}, { versionKey: false });

const Reward_object = mongoose.model('Reward_object', reward_object_schema, 'reward_object');

module.exports = { Reward_object };
