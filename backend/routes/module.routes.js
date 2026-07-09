const express = require('express');
const router = express.Router();
const {
  getModules, getAllModules, uploadModule, updateModule, deleteModule,
} = require('../controllers/module.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectActiveMember } = require('../middleware/user.auth.middleware');
const { uploadModule: uploadModuleMiddleware } = require('../config/multer');

// Member aktif bisa akses list modul
router.get('/', protectActiveMember, getModules);

// Admin only
router.get('/all', protect, getAllModules);
router.post('/', protect, uploadModuleMiddleware.single('file'), uploadModule);
router.put('/:id', protect, updateModule);
router.delete('/:id', protect, deleteModule);

module.exports = router;