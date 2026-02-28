const express = require('express');
const router = express.Router();
const { register, login, validateReferral, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

router.post('/register', register);
router.post('/login', login);
router.get('/validate-referral/:code', validateReferral);
router.get('/me', authenticateToken, getMe);

// One-time admin setup endpoint — protected by a secret key
router.post('/init-admin', async (req, res) => {
    try {
        const { secret } = req.body;
        // Simple secret check to prevent unauthorized access
        if (secret !== 'MARATHAMALL_SETUP_2026') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const adminEmail = 'marathamall1@gmail.com';
        const adminPassword = 'Shailu@7387';
        const adminReferralCode = 'JOINSM';

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Try to find by referral code first (existing admin)
        let user = await User.findOne({ where: { referral_code: adminReferralCode } });

        if (user) {
            user.email = adminEmail;
            user.name = 'Admin User';
            user.role = 'admin';
            user.status = 'active';
            user.password_hash = hashedPassword;
            await user.save();
            return res.json({ message: 'Admin updated successfully', email: adminEmail });
        }

        // Try by email
        user = await User.findOne({ where: { email: adminEmail } });
        if (user) {
            user.role = 'admin';
            user.status = 'active';
            user.referral_code = adminReferralCode;
            user.password_hash = hashedPassword;
            await user.save();
            return res.json({ message: 'Admin updated successfully', email: adminEmail });
        }

        // Create fresh admin
        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password_hash: hashedPassword,
            referral_code: adminReferralCode,
            role: 'admin',
            status: 'active'
        });

        return res.json({ message: 'Admin created successfully', email: adminEmail });

    } catch (error) {
        console.error('Init admin error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

