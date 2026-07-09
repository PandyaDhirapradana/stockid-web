const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Member = require('../models/Member.model');
const Transaction = require('../models/Transaction.model');
const { sendPasswordResetEmail, sendPaymentReceiptEmail } = require('../utils/email');

const generateToken = (id) => jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, {
  expiresIn: '7d',
});

// POST /api/user/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, equity, tradingExperience } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Nama minimal 2 karakter' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    }
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Nomor HP tidak valid. Gunakan format: 08xxxxxxxxxx' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) return res.status(400).json({ success: false, message: 'Nomor HP sudah terdaftar' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      password,
      equity: equity?.trim() || '',
      tradingExperience: tradingExperience?.trim() || '',
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: { token, user } });
  } catch (error) { next(error); }
};

// POST /api/user/auth/login — support email atau nomor HP
const login = async (req, res, next) => {
  try {
    const { identifier, password, loginMethod } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/nomor HP dan password wajib diisi' });
    }

    let user;
    if (loginMethod === 'phone') {
      user = await User.findOne({ phone: identifier.trim() }).select('+password');
    } else {
      user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email/nomor HP atau password salah' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login berhasil', data: { token, user } });
  } catch (error) { next(error); }
};

// POST /api/user/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'Jika email terdaftar, link reset telah dikirim.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetToken, resetUrl);

    res.json({ success: true, message: 'Jika email terdaftar, link reset telah dikirim.' });
  } catch (error) { next(error); }
};

// POST /api/user/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token dan password wajib diisi' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiry');

    if (!user) return res.status(400).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password berhasil direset. Silakan login.' });
  } catch (error) { next(error); }
};

// GET /api/user/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// GET /api/user/auth/payment-status
const getPaymentStatus = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email },
        { phone: req.user.phone },
      ],
      // Hapus filter status: 'approved' — tampilkan semua termasuk pending
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ success: true, data: transactions });
  } catch (error) { next(error); }
};

// GET /api/user/auth/profile — profil lengkap dengan history
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    // Ambil history transaksi approved
    const transactions = await Transaction.find({
      $or: [
        { userId: user._id },
        { email: user.email },
        { phone: user.phone },
      ],
      status: 'approved',
    }).sort({ createdAt: -1 });

    // Ambil data member aktif
    const member = await Member.findOne({ phone: user.phone });

    res.json({
      success: true,
      data: {
        user,
        member: member || null,
        transactions,
      },
    });
  } catch (error) { next(error); }
};

// PUT /api/user/auth/profile — edit profil
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, equity, tradingExperience } = req.body;
    const userId = req.user._id;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    }
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Format nomor HP tidak valid' });
    }

    // Cek duplikasi email
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existing) return res.status(400).json({ success: false, message: 'Email sudah digunakan akun lain' });
    }

    // Cek duplikasi phone
    if (phone) {
      const existing = await User.findOne({ phone: phone.trim(), _id: { $ne: userId } });
      if (existing) return res.status(400).json({ success: false, message: 'Nomor HP sudah digunakan akun lain' });
    }

    const oldPhone = req.user.phone;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase();
    if (phone) updates.phone = phone.trim();
    if (equity !== undefined) updates.equity = equity.trim();
    if (tradingExperience !== undefined) updates.tradingExperience = tradingExperience.trim();

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    // Sync ke Member jika phone berubah
    if (phone && phone.trim() !== oldPhone) {
      await Member.findOneAndUpdate(
        { phone: oldPhone },
        { phone: phone.trim() }
      );
    }

    // Sync nama ke Member jika nama berubah
    if (name) {
      await Member.findOneAndUpdate(
        { phone: updatedUser.phone },
        { name: name.trim() }
      );
    }

    res.json({ success: true, message: 'Profil berhasil diperbarui', data: updatedUser });
  } catch (error) { next(error); }
};

module.exports = {
  register, login, forgotPassword, resetPassword,
  getMe, getPaymentStatus, getProfile, updateProfile,
};