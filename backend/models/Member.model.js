const mongoose = require('mongoose');

const durationHistorySchema = new mongoose.Schema({
  addedBy: { type: String, default: 'system' },
  addedDays: { type: Number, required: true },
  previousEndDate: { type: Date },
  newEndDate: { type: Date, required: true },
  reason: { type: String, default: 'Manual extension' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now },
});

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+62|62|0)[0-9]{8,13}$/, 'Invalid Indonesian phone number'],
  },
  classCategory: {
    type: String,
    required: [true, 'Class category is required'],
    enum: ['Paket Screener', 'Paket Kelas 1 Bulan', 'Paket Kelas 2 Bulan',
    'Paket Kelas 3 Bulan', 'Paket Kelas 6 Bulan', 'Paket Kelas 1 Tahun'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  durationHistory: [durationHistorySchema],
}, { timestamps: true });

// Virtual: isActive
memberSchema.virtual('isActive').get(function () {
  return new Date() < this.endDate;
});

memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);