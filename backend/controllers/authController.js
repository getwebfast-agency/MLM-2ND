const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const ReferralClosure = require('../models/ReferralClosure');


exports.register = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, contact, password, referral_code } = req.body;

        // Validate sponsor
        const sponsor = await User.findOne({ where: { referral_code } });
        if (!sponsor) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid referral code' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate new referral code (ensure uniqueness)
        let newReferralCode;
        let isUnique = false;
        while (!isUnique) {
            newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existingUser = await User.findOne({ where: { referral_code: newReferralCode }, transaction: t });
            if (!existingUser) {
                isUnique = true;
            }
        }

        const isEmail = contact.includes('@');
        const email = isEmail ? contact : null;
        const phone = !isEmail ? contact : null;

        // Check if user already exists
        const existingContact = await User.findOne({
            where: isEmail ? { email } : { phone }
        });

        if (existingContact) {
            await t.rollback();
            return res.status(400).json({ message: `${isEmail ? 'Email' : 'Phone'} is already registered` });
        }

        // Create User
        const newUser = await User.create({
            name,
            email,
            phone,
            password_hash: hashedPassword,
            referral_code: newReferralCode,
            sponsor_id: sponsor.id,
        }, { transaction: t });


        // Update Closure Table
        // 1. Get all ancestors of the sponsor
        const ancestors = await ReferralClosure.findAll({
            where: { descendant_id: sponsor.id },
            transaction: t,
        });

        // 2. Insert rows for all ancestors -> new user
        const closureEntries = ancestors.map(a => ({
            ancestor_id: a.ancestor_id,
            descendant_id: newUser.id,
            depth: a.depth + 1,
        }));

        // 3. Insert row for sponsor -> new user (depth 1)
        closureEntries.push({
            ancestor_id: sponsor.id,
            descendant_id: newUser.id,
            depth: 1,
        });

        // 4. Insert row for self reference (depth 0)
        closureEntries.push({
            ancestor_id: newUser.id,
            descendant_id: newUser.id,
            depth: 0,
        });

        await ReferralClosure.bulkCreate(closureEntries, { transaction: t });

        await t.commit();

        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { contact, email, password } = req.body;
        const loginContact = contact || email; // fallback
        const isEmail = loginContact.includes('@');

        const user = await User.findOne({
            where: isEmail ? { email: loginContact } : { phone: loginContact }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, referral_code: user.referral_code, email: user.email, phone: user.phone } });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.validateReferral = async (req, res) => {
    try {
        const { code } = req.params;
        const sponsor = await User.findOne({ where: { referral_code: code } });

        if (!sponsor) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        res.json({ message: 'Valid referral code', sponsor: { name: sponsor.name, code: sponsor.referral_code } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'phone', 'role', 'referral_code', 'status', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
