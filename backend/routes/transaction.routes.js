const express = require('express');
const router = express.Router();
const { getAllTransactions, approveTransaction, rejectTransaction } = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAllTransactions);
router.patch('/:id/approve', approveTransaction);
router.patch('/:id/reject', rejectTransaction);

module.exports = router;