const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.model');
const { protect, requireRole } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

// GET /api/admin/user-by-phone/:phone
router.get('/user-by-phone/:phone', protect, async (req, res, next) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// GET /api/admin/list — superadmin only
router.get('/list', protect, requireRole('superadmin'), async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-__v');
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/create — superadmin only
router.post('/create', protect, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const admin = await Admin.create({ name, email, password, role: role || 'admin' });
    res.status(201).json({ success: true, message: 'Admin created', data: admin });
  } catch (error) {
    next(error);
  }
});

module.exports = router;