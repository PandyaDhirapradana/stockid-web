const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Member = require('../models/Member.model');
const Admin = require('../models/Admin.model');

const protectUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'user') {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success: false, message: 'User tidak ditemukan.' });
      req.user = user;
      req.isAdmin = false;
    } else {
      // Token admin
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(401).json({ success: false, message: 'Token tidak valid.' });
      req.user = admin;
      req.isAdmin = true;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid.' });
  }
};

const protectActiveMember = async (req, res, next) => {
  protectUser(req, res, async () => {
    try {
      // Admin bypass langsung
      if (req.isAdmin) return next();

      // User biasa — wajib cek member aktif berdasarkan phone
      const member = await Member.findOne({
        phone: req.user.phone,
        endDate: { $gt: new Date() },
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Anda bukan member aktif atau masa aktif telah habis.',
        });
      }

      req.member = member;
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = { protectUser, protectActiveMember };