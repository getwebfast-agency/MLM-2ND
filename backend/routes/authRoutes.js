const express = require('express');
const router = express.Router();
const { register, login, validateReferral, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/validate-referral/:code', validateReferral);
router.get('/me', authenticateToken, getMe);

module.exports = router;
