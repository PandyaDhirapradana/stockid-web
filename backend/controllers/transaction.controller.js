const Transaction = require('../models/Transaction.model');
const Member = require('../models/Member.model');
const { generateWhatsAppUrl } = require('../utils/whatsapp');
const { getPrice } = require('../utils/pricing');

// GET /api/transactions
const getAllTransactions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('approvedBy', 'name email')
      .populate('memberId', 'name endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/transactions/:id/approve
const approveTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Transaction is already ${transaction.status}` });
    }

    const pricing = getPrice(transaction.classCategory);
    if (!pricing) return res.status(400).json({ success: false, message: 'Invalid class category' });

    const approvalDate = new Date();
    let member = null;
    let waUrl = '';

    // Paket Screener — TIDAK mengaktifkan membership
    if (pricing.isScreener) {
      transaction.status = 'approved';
      transaction.approvedBy = req.admin._id;
      transaction.approvedAt = approvalDate;
      await transaction.save();

      // Generate WA untuk notifikasi screener
      waUrl = generateWhatsAppUrl(
        transaction.phone, transaction.name,
        transaction.classCategory, null, true
      );

      return res.json({
        success: true,
        message: 'Transaksi screener disetujui. Kirim akses screener via WhatsApp.',
        data: { transaction, member: null, whatsappUrl: waUrl, isScreener: true },
      });
    }

    // Paket Kelas — aktifkan membership seperti biasa
    const endDate = new Date(approvalDate);
    endDate.setDate(endDate.getDate() + pricing.durationDays);

    member = await Member.findOne({ phone: transaction.phone });

    if (member) {
      const previousEndDate = new Date(member.endDate);
      const baseDate = previousEndDate < approvalDate ? approvalDate : previousEndDate;
      const newEndDate = new Date(baseDate);
      newEndDate.setDate(newEndDate.getDate() + pricing.durationDays);
      member.endDate = newEndDate;
      member.classCategory = transaction.classCategory;
      member.durationHistory.push({
        addedBy: req.admin.name,
        addedDays: pricing.durationDays,
        previousEndDate,
        newEndDate,
        reason: `Payment approved - Order: ${transaction.orderId}`,
        transactionId: transaction._id,
      });
      await member.save();
    } else {
      member = await Member.create({
        name: transaction.name,
        phone: transaction.phone,
        classCategory: transaction.classCategory,
        startDate: approvalDate,
        endDate,
        durationHistory: [{
          addedBy: req.admin.name,
          addedDays: pricing.durationDays,
          previousEndDate: null,
          newEndDate: endDate,
          reason: `Initial payment - Order: ${transaction.orderId}`,
          transactionId: transaction._id,
        }],
      });
    }

    transaction.status = 'approved';
    transaction.approvedBy = req.admin._id;
    transaction.approvedAt = approvalDate;
    transaction.memberId = member._id;
    await transaction.save();

    waUrl = generateWhatsAppUrl(
      transaction.phone, transaction.name,
      transaction.classCategory, member.endDate, false
    );

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: { transaction, member, whatsappUrl: waUrl, isScreener: false },
    });
  } catch (error) { next(error); }
};

// PATCH /api/transactions/:id/reject
const rejectTransaction = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Transaction is already ${transaction.status}` });
    }

    transaction.status = 'rejected';
    transaction.approvedBy = req.admin._id;
    transaction.approvedAt = new Date();
    await transaction.save();

    res.json({ success: true, message: 'Transaction rejected', data: transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTransactions, approveTransaction, rejectTransaction };