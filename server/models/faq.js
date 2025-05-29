const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, {
  versionKey: false
});

const Faq = mongoose.model('Faq', faqSchema, 'faq');

module.exports = { Faq };
