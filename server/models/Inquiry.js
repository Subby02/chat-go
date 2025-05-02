const mongoose = require('mongoose');

const inquirySchema = mongoose.Schema({
  user_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: { type: String, required: true },
  answer: { type: String, default: '' },           // 관리자 답변
  answerDate: { type: Date },                      // 답변 시간
  status: { type: String, default: '답변대기' }     // 상태 관리
}, {
  versionKey: false
});

const Inquiry = mongoose.model('Inquiry', inquirySchema, 'inquiry');

module.exports = { Inquiry };