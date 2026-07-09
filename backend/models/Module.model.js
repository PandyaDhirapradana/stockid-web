const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul modul wajib diisi'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: String,
    default: 'admin',
  },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);