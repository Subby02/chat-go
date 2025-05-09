const mongoose = require('mongoose');

const authCodeSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  code: {
    type: String, // 6자리 인증 코드 (숫자지만 문자열로 저장하는 것이 일반적)
    required: true,
  },
}, {
  timestamps: true, versionKey: false // createdAt, updatedAt 자동 생성
});

// TTL 인덱스를 createdAt에 대해 설정: 3분 후 자동 삭제 (180초)
authCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 });

const AuthCode = mongoose.model('AuthCode', authCodeSchema, 'auth_codes');

module.exports = { AuthCode };