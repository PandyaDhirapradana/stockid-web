const express = require('express');
const router = express.Router();
const {
  getAllMembers, createMember, updateMember,
  deleteMember, extendMember, exportMembers,
  getMemberStats, extendAllActiveMembers,
} = require('../controllers/member.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validateMember } = require('../middleware/validate.middleware');

router.get('/stats', getMemberStats);

router.use(protect);

router.get('/export', exportMembers);
router.get('/', getAllMembers);
router.post('/', validateMember, createMember);
router.put('/:id', updateMember);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteMember);
router.patch('/:id/extend', extendMember);
router.patch('/extend-all', extendAllActiveMembers); // tambahkan ini

module.exports = router;