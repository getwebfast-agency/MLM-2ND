const { User, sequelize, Order, Commission, ReferralClosure, Product, OrderItem } = require('../models');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
    try {
        console.log('GET /admin/users request received:', req.query);
        const { search, status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { referral_code: { [Op.like]: `%${search}%` } }
            ];
        }

        console.log('Querying User model...');
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'role', 'status', 'referral_code', 'plain_password', 'createdAt', 'sponsor_id'],
            include: [
                { model: User, as: 'sponsor', attributes: ['name', 'referral_code'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        console.log(`Found ${count} users. Processing enhanced rows...`);

        // Enhance rows with direct referral counts (could be optimized with subqueries)
        // Enhance rows with safe handling
        const enhancedRows = await Promise.all(rows.map(async (user) => {
            try {
                const directReferrals = await User.count({ where: { sponsor_id: user.id } });
                const descendants = await ReferralClosure.count({ where: { ancestor_id: user.id } });
                // If descendants > 0, it includes self, so subtract 1. If 0, then 0.
                const totalDownline = descendants > 0 ? descendants - 1 : 0;

                return {
                    ...user.toJSON(),
                    directReferrals,
                    totalDownline
                };
            } catch (err) {
                console.error(`Error processing user ${user.id}:`, err);
                return { ...user.toJSON(), directReferrals: 0, totalDownline: 0 };
            }
        }));

        console.log('Sending response with users:', enhancedRows.length);
        res.json({
            users: enhancedRows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalUsers: count
        });
    } catch (error) {
        console.error('CRITICAL ERROR in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message, stack: error.stack });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        const adminId = req.user.id;
        const totalMembers = await User.count();
        const activeMembers = await User.count({ where: { status: 'active' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newRegistrations = await User.count({
            where: { createdAt: { [Op.gte]: today } }
        });

        // Admin Specific Stats (Net Profit Logic)
        const adminUser = await User.findByPk(adminId);

        // 1. Total Revenue (Sum of all completed orders)
        const totalRevenue = await Order.sum('total_amount', { where: { status: 'completed' } });

        // 2. Total Commissions Paid Out (Exclude Admin's own commissions if any, or include depending on "Company Profit" view)
        // User said: "earning of the admin is the total and minus of the commissions"
        // This implies Net Profit.
        // We should subtract commissions paid to OTHERS.
        // If Admin receives a commission (e.g. self-referral), it's internal money, so we don't subtract it?
        // Or if we strictly follow "Total - Commissions", we subtract ALL commissions.
        // But user said: "when referral code of admin used... total earning is total price". 
        // This suggests NO commission is subtracted in that case.
        // So we should subtract only commissions paid to non-admin users.

        const totalPayouts = await Commission.sum('amount', {
            where: {
                user_id: { [Op.ne]: adminId }
            }
        });

        const adminNetEarnings = (totalRevenue || 0) - (totalPayouts || 0);

        // Construct referral link (assuming frontend URL)
        // Hardcoding base URL for now or using env if available
        // But for response we just send code

        res.json({
            totalMembers,
            activeMembers,
            newRegistrations,
            adminStats: {
                totalEarnings: adminNetEarnings,
                referralCode: adminUser ? adminUser.referral_code : 'N/A'
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

exports.getChartStats = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'createdAt']
        });

        const orders = await Order.findAll({
            where: { status: 'completed' },
            attributes: ['id', 'total_amount', 'createdAt']
        });

        res.json({ users, orders });
    } catch (error) {
        console.error('Error fetching chart stats:', error);
        res.status(500).json({ message: 'Error fetching chart stats', error: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;
        await user.save();
        res.json({ message: 'User status updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};
exports.getMemberDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get direct referrals count
        const directReferrals = await User.count({ where: { referral_code: { [Op.ne]: null } } }); // Simplified, ideally check referrer_code

        // Get total earnings
        const earnings = await Commission.sum('amount', { where: { user_id: id } });

        // Get recent orders
        const orders = await Order.findAll({
            where: { user_id: id },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            user,
            stats: {
                directReferrals: 0, // Placeholder as we need schema adjustment to track direct sponsor efficiently or query closure table
                totalEarnings: earnings || 0,
                orderCount: orders.length
            },
            recentOrders: orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member details', error: error.message });
    }
};

exports.getFullNetwork = async (req, res) => {
    try {
        // Fetch specific branch if rootId is provided, else full tree
        const { rootId } = req.query;

        let whereClause = { depth: 1 };
        if (rootId) {
            // Logic to fetch subtree would go here. 
            // For now, full tree is okay for moderate sizes.
        }

        const relationships = await ReferralClosure.findAll({
            where: { depth: 1 },
            include: [
                { model: User, as: 'ancestor', attributes: ['id', 'name', 'referral_code'] },
                { model: User, as: 'descendant', attributes: ['id', 'name', 'role', 'status', 'referral_code', 'sponsor_id'] }
            ]
        });

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'status', 'referral_code', 'sponsor_id', 'createdAt']
        });

        // Enhance users with stats
        // We need: Team Size (total descendants), Directs, and Depth (distance from root)

        // 1. Find Root (Admin)
        const rootUser = users.find(u => u.role === 'admin'); // Assuming single admin or first admin is root
        const rootIdForDepth = rootUser ? rootUser.id : null;

        const enhancedUsers = await Promise.all(users.map(async (user) => {
            // Team Count (total descendants)
            // ancestor_id = user.id. Count how many rows.
            const descendantCount = await ReferralClosure.count({
                where: { ancestor_id: user.id }
            });
            const teamCount = descendantCount > 0 ? descendantCount - 1 : 0; // Subtract self

            // Direct Referrals
            // sponsor_id = user.id
            const directReferrals = await User.count({
                where: { sponsor_id: user.id }
            });

            // Depth (Distance from Root)
            let depth = 0;
            if (rootIdForDepth && user.id !== rootIdForDepth) {
                const depthRel = await ReferralClosure.findOne({
                    where: {
                        ancestor_id: rootIdForDepth,
                        descendant_id: user.id
                    }
                });
                if (depthRel) {
                    depth = depthRel.depth;
                }
            }

            return {
                ...user.toJSON(),
                teamCount,
                directReferrals,
                depth
            };
        }));

        res.json({ users: enhancedUsers, relationships });
    } catch (error) {
        console.error('Error fetching network:', error);
        res.status(500).json({ message: 'Error fetching network', error: error.message });
    }
};

exports.getSalesReports = async (req, res) => {
    try {
        const sales = await Order.findAll({
            where: { status: 'completed' },
            include: [
                { model: User, attributes: ['name', 'email', 'referral_code'] },
                { model: Commission, attributes: ['amount'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const enrichedSales = await Promise.all(sales.map(async (order) => {
            let referrer = null;
            if (order.referral_code) {
                referrer = await User.findOne({
                    where: { referral_code: order.referral_code },
                    attributes: ['name', 'email']
                });
            }

            // Calculate total commission generated from this order
            const commissionGenerated = order.Commissions
                ? order.Commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
                : 0;

            return {
                ...order.toJSON(),
                referrer,
                commissionGenerated
            };
        }));

        res.json(enrichedSales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error fetching sales reports', error: error.message });
    }
};

exports.getCategoryStats = async (req, res) => {
    try {
        // Join OrderItems -> Products to group by category
        // simple approach: fetch all products and aggregate sold info if possible,
        // or just count products by category for now.
        const stats = await Product.findAll({
            attributes: ['category', [sequelize.fn('count', sequelize.col('id')), 'count']],
            group: ['category']
        });
        res.json(stats);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching category stats', error: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

exports.changeSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const { newSponsorId } = req.body;

        const user = await User.findByPk(id);
        const newSponsor = await User.findByPk(newSponsorId);

        if (!user || !newSponsor) return res.status(404).json({ message: 'User or New Sponsor not found' });
        if (user.id === newSponsor.id) return res.status(400).json({ message: 'Cannot sponsor self' });

        user.sponsor_id = newSponsor.id;
        await user.save();

        res.json({ message: 'Sponsor changed successfully', user });
    } catch (error) {
        console.error('Change Sponsor Error:', error);
        res.status(500).json({ message: 'Failed to change sponsor', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const downlineCount = await User.count({ where: { sponsor_id: id } });
        if (downlineCount > 0) {
            return res.status(400).json({ message: 'Cannot delete user with active downline. Move members first.' });
        }

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

exports.getMemberEarnings = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = { role: 'member' }; // Only show members, not admin

        if (search) {
            whereClause = {
                role: 'member',
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { referral_code: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Fetch all matching members
        const members = await User.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'referral_code', 'status'],
            order: [['name', 'ASC']]
        });

        // For each member, fetch their total commission earnings
        const earningsData = await Promise.all(members.map(async (member) => {
            const totalEarnings = await Commission.sum('amount', {
                where: { user_id: member.id }
            }) || 0;

            return {
                ...member.toJSON(),
                totalEarnings
            };
        }));

        // Sort by totalEarnings descending
        earningsData.sort((a, b) => b.totalEarnings - a.totalEarnings);

        res.json(earningsData);
    } catch (error) {
        console.error('Error fetching member earnings:', error);
        res.status(500).json({ message: 'Error fetching member earnings', error: error.message });
    }
};

exports.getMemberEarningDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const commissions = await Commission.findAll({
            where: { user_id: id },
            include: [
                {
                    model: User,
                    as: 'source',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Order,
                    attributes: ['id', 'total_amount', 'createdAt'],
                    include: [
                        {
                            model: OrderItem,
                            include: [
                                {
                                    model: Product,
                                    attributes: ['id', 'name', 'price']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(commissions);
    } catch (error) {
        console.error('Error fetching member earning details:', error);
        res.status(500).json({ message: 'Error fetching member earning details', error: error.message });
    }
};
