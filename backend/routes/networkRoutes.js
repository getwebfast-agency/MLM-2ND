const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getTree, getDirectReferrals, getStats } = require('../controllers/networkController');

router.use(authenticateToken); // Protect all network routes

router.get('/tree', getTree);
router.get('/directs', getDirectReferrals);
router.get('/stats', getStats);
router.get('/downline', require('../controllers/networkController').getDownline);

module.exports = router;
