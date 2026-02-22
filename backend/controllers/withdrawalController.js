const { Withdrawal, Commission, User } = require('../models');
const { Op } = require('sequelize');

exports.requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, payment_method, payment_details } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Withdrawal amount must be greater than 0' });
        }

        // Calculate total earnings
        const earnings = await Commission.sum('amount', { where: { user_id: userId } });
        const totalEarnings = earnings || 0;

        // Calculate previous successful or pending withdrawals
        const withdrawals = await Withdrawal.sum('amount', {
            where: {
                user_id: userId,
                status: { [Op.in]: ['pending', 'approved'] }
            }
        });
        const totalWithdrawn = withdrawals || 0;

        const availableBalance = totalEarnings - totalWithdrawn;

        if (amount > availableBalance) {
            return res.status(400).json({ message: `Insufficient balance. Available balance is ₹${availableBalance.toFixed(2)}` });
        }

        const withdrawal = await Withdrawal.create({
            user_id: userId,
            amount,
            payment_method,
            payment_details
        });

        res.status(201).json({ message: 'Withdrawal request submitted successfully', withdrawal });
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ message: 'Failed to submit withdrawal request', error: error.message });
    }
};

exports.getMyWithdrawals = async (req, res) => {
    try {
        const userId = req.user.id;
        const withdrawals = await Withdrawal.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });

        // Compute available balance
        const earnings = await Commission.sum('amount', { where: { user_id: userId } });
        const totalEarnings = earnings || 0;
        const withdrawnSum = await Withdrawal.sum('amount', {
            where: {
                user_id: userId,
                status: { [Op.in]: ['pending', 'approved'] }
            }
        });
        const totalWithdrawn = withdrawnSum || 0;
        const availableBalance = totalEarnings - totalWithdrawn;

        res.json({ withdrawals, availableBalance, totalWithdrawn });
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawals', error: error.message });
    }
};

exports.getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(withdrawals);
    } catch (error) {
        console.error('Error fetching all withdrawals:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawals', error: error.message });
    }
};

exports.processWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_remark } = req.body; // status should be 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const withdrawal = await Withdrawal.findByPk(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: `Withdrawal is already ${withdrawal.status}` });
        }

        withdrawal.status = status;
        withdrawal.admin_remark = admin_remark;
        await withdrawal.save();

        res.json({ message: `Withdrawal request ${status} successfully`, withdrawal });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ message: 'Failed to process withdrawal', error: error.message });
    }
};
