const mongoose = require('mongoose');

const gainPhotoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  caption: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GainPhoto', gainPhotoSchema);