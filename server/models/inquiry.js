const mongoose = require('mongoose');

const inquirySchema = mongoose.Schema({
  user_id: { type: String, required: true },
  writer: { type: String, required: true},
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPublic: { type: Boolean, default: true },  // ✅ 추가: 공개 여부
  answer: { type: String, default: '' },
  answerDate: { type: Date },
  status: { type: String, default: '답변대기' }
}, {
  versionKey: false
});


const Inquiry = mongoose.model('Inquiry', inquirySchema, 'inquiry');

module.exports = { Inquiry };
