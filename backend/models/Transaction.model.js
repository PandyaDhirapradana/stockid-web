const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  classCategory: { type: String, required: true, enum: ['Paket Screener', 'Paket Kelas 1 Bulan', 'Paket Kelas 2 Bulan',
    'Paket Kelas 3 Bulan', 'Paket Kelas 6 Bulan', 'Paket Kelas 1 Tahun'] },
  amount: { type: Number, required: true, min: 1000 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  // Status dari Midtrans — terpisah dari status approval admin
  midtransStatus: {
    type: String,
    enum: ['waiting', 'settlement', 'capture', 'rejected'],
    default: 'waiting',
  },
  transactionDate: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  midtransResponse: { type: mongoose.Schema.Types.Mixed, select: false },
  snapToken: { type: String, select: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);