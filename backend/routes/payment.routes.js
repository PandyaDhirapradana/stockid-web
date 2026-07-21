const express = require('express');
const router = express.Router();
const { createTransaction, handleNotification } = require('../controllers/payment.controller');
const { validatePayment } = require('../middleware/validate.middleware');
const { protectUser } = require('../middleware/user.auth.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/create-transaction', protectUser, validatePayment, createTransaction);
router.post('/notification', handleNotification);

// ENDPOINT SIMULASI SIDANG — hanya bisa diakses admin yang login
// Hapus setelah sidang selesai
router.patch('/dev/settle/:orderId', protect, async (req, res) => {
  try {
    const Transaction = require('../models/Transaction.model');
    const tx = await Transaction.findOneAndUpdate(
      { orderId: req.params.orderId },
      { midtransStatus: 'settlement', transactionDate: new Date() },
      { new: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;