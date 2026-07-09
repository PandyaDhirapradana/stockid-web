const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register, login, forgotPassword, resetPassword,
  getMe, getPaymentStatus, getProfile, updateProfile,
} = require('../controllers/user.auth.controller');
const { protectUser } = require('../middleware/user.auth.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protectUser, getMe);
router.get('/payment-status', protectUser, getPaymentStatus);
router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, updateProfile);

module.exports = router;