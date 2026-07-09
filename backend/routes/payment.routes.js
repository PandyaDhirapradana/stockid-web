const express = require('express');
const router = express.Router();
const { createTransaction, handleNotification } = require('../controllers/payment.controller');
const { validatePayment } = require('../middleware/validate.middleware');
const { protectUser } = require('../middleware/user.auth.middleware');

// User harus login untuk buat transaksi
router.post('/create-transaction', protectUser, validatePayment, createTransaction);
router.post('/notification', handleNotification);

module.exports = router;

// DEVELOPMENT ONLY — hapus sebelum deploy production
if (process.env.NODE_ENV === 'development') {
  router.patch('/simulate-settlement/:orderId', async (req, res) => {
    const Transaction = require('../models/Transaction.model');
    const tx = await Transaction.findOneAndUpdate(
      { orderId: req.params.orderId },
      { midtransStatus: 'settlement', transactionDate: new Date() },
      { new: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tx });
  });
}