const midtransClient = require('midtrans-client');
const Transaction = require('../models/Transaction.model');
const { getPrice } = require('../utils/pricing');
const { sendPaymentReceiptEmail } = require('../utils/email');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const createTransaction = async (req, res, next) => {
  try {
    const { name, phone, email, classCategory } = req.body;

    const pricing = getPrice(classCategory);
    if (!pricing) return res.status(400).json({ success: false, message: 'Invalid class category' });
    if (!req.user) return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });

    const orderId = `SC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: pricing.price },
      customer_details: {
        first_name: name.trim(),
        phone: phone.trim(),
        email: email?.trim(),
      },
      item_details: [{
        id: classCategory,
        price: pricing.price,
        quantity: 1,
        name: `StockClass ${classCategory} - 30 Hari`,
      }],
      callbacks: { finish: `${process.env.FRONTEND_URL}?payment=success` },
    };

    const snapResponse = await snap.createTransaction(parameter);

    await Transaction.create({
      orderId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || req.user.email,
      classCategory,
      amount: pricing.price,
      status: 'pending',
      midtransStatus: 'waiting',
      snapToken: snapResponse.token,
      userId: req.user._id,
    });

    // Kirim email struk awal
    if (email || req.user.email) {
      sendPaymentReceiptEmail(
        email || req.user.email, name, orderId, classCategory, pricing.price, 'pending'
      ).catch(console.error);
    }

    res.json({
      success: true,
      data: {
        snapToken: snapResponse.token,
        orderId,
        amount: pricing.price,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      },
    });
  } catch (error) { next(error); }
};

const handleNotification = async (req, res, next) => {
  try {
    const notification = req.body;
    const crypto = require('crypto');
    const { order_id, status_code, gross_amount, signature_key } = notification;

    // Verifikasi signature
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    const transaction = await Transaction.findOne({ orderId: order_id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    transaction.midtransResponse = notification;
    const ts = notification.transaction_status;
    const fraud = notification.fraud_status;

    if (ts === 'settlement') {
      // Uang sudah masuk — tandai siap untuk di-approve admin
      transaction.midtransStatus = 'settlement';
      transaction.transactionDate = new Date();
    } else if (ts === 'capture') {
      // Credit card capture
      if (fraud === 'accept') {
        transaction.midtransStatus = 'capture';
        transaction.transactionDate = new Date();
      } else {
        transaction.midtransStatus = 'rejected';
        transaction.status = 'rejected';
      }
    } else if (['deny', 'cancel', 'expire', 'failure'].includes(ts)) {
      transaction.midtransStatus = 'rejected';
      transaction.status = 'rejected';
    }

    await transaction.save();
    res.json({ success: true });
  } catch (error) { next(error); }
};

module.exports = { createTransaction, handleNotification };