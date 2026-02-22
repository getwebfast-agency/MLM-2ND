const express = require('express');
const router = express.Router();
const { register, login, validateReferral, sendOTP } = require('../controllers/authController');

router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/validate-referral/:code', validateReferral);

module.exports = router;
