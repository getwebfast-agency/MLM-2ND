const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const withdrawalController = require('../controllers/withdrawalController');

// User routes
router.post('/request', authenticateToken, withdrawalController.requestWithdrawal);
router.get('/my-withdrawals', authenticateToken, withdrawalController.getMyWithdrawals);

// Admin routes
router.get('/all', authenticateToken, isAdmin, withdrawalController.getAllWithdrawals);
router.put('/:id/process', authenticateToken, isAdmin, withdrawalController.processWithdrawal);

module.exports = router;
