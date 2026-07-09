const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboard.controller');
const { protectActiveMember } = require('../middleware/user.auth.middleware');

// Hanya member aktif yang bisa akses
router.get('/', protectActiveMember, getLeaderboard);

module.exports = router;