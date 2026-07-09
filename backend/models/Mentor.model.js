const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  type: { type: String, required: true }, // whatsapp, instagram, tiktok, sms, dll
  label: { type: String, required: true },
  value: { type: String, required: true }, // nomor/username/link
});

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: "Mentor of Stock's ID" },
  equity: { type: String, trim: true },
  tradingStyle: { type: String, trim: true },
  imageUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  contacts: [contactSchema],
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);