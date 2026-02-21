const { User, sequelize } = require('../models');
const ReferralClosure = require('../models/ReferralClosure');
const { Op } = require('sequelize');

exports.getTree = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware

        // Fetch all descendants
        const genealogy = await ReferralClosure.findAll({
            where: { ancestor_id: userId },
            include: [
                {
                    model: User,
                    as: 'descendant',
                    attributes: ['id', 'name', 'referral_code', 'sponsor_id', 'status', 'role', 'createdAt'],
                }
            ],
            order: [['depth', 'ASC']],
        });

        // Map to flat array and deduplicate
        const uniqueNodes = new Map();
        genealogy.forEach(g => {
            if (!g.descendant) return;
            // distinct on descendant.id
            if (!uniqueNodes.has(g.descendant.id)) {
                uniqueNodes.set(g.descendant.id, {
                    ...g.descendant.dataValues,
                    depth: g.depth,
                    sponsor_id: g.descendant.sponsor_id
                });
            }
        });

        let tree = Array.from(uniqueNodes.values());

        // Ensure Root (Self) is in the tree
        // Sometimes closure table might miss the (self, self, 0) entry or logic excludes it.
        // We explicitly check if userId is in the tree.
        const rootInTree = tree.find(u => u.id === userId);
        if (!rootInTree) {
            const rootUser = await User.findByPk(userId, {
                attributes: ['id', 'name', 'referral_code', 'sponsor_id', 'status', 'role', 'createdAt']
            });
            if (rootUser) {
                tree.unshift({
                    ...rootUser.dataValues,
                    depth: 0,
                    sponsor_id: rootUser.sponsor_id
                });
            }
        }

        res.json({ rootId: userId, tree });
    } catch (error) {
        console.error('Error in getTree:', error);
        res.status(500).json({ message: 'Error fetching tree', error: error.message });
    }
};

exports.getDirectReferrals = async (req, res) => {
    try {
        const directs = await User.findAll({
            where: { sponsor_id: req.user.id },
            attributes: ['id', 'name', 'email', 'status', 'createdAt']
        });
        res.json(directs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referrals', error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total downline count (excluding self)
        const downlineCount = await ReferralClosure.count({
            distinct: true,
            col: 'descendant_id',
            where: {
                ancestor_id: userId,
                depth: { [Op.gt]: 0 }
            }
        });

        const directCount = await User.count({ where: { sponsor_id: userId } });

        res.json({
            totalDownline: downlineCount,
            directReferrals: directCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

exports.getDownline = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all descendants with their depth relative to the current user
        const genealogy = await ReferralClosure.findAll({
            where: {
                ancestor_id: userId,
                depth: { [Op.gt]: 0 } // Exclude self
            },
            include: [
                {
                    model: User,
                    as: 'descendant',
                    attributes: ['id', 'name', 'email', 'status', 'createdAt', 'role']
                }
            ],
            order: [['depth', 'ASC'], [sequelize.col('descendant.createdAt'), 'DESC']]
        });

        // Map to a clean structure and deduplicate
        const uniqueIds = new Set();
        const downline = [];

        genealogy.forEach(g => {
            if (!g.descendant || uniqueIds.has(g.descendant.id)) return;
            uniqueIds.add(g.descendant.id);

            downline.push({
                id: g.descendant.id,
                name: g.descendant.name,
                email: g.descendant.email, // Consider masking this for privacy if needed
                status: g.descendant.status,
                joinDate: g.descendant.createdAt,
                level: g.depth,
                role: g.descendant.role
            });
        });

        res.json(downline);
    } catch (error) {
        console.error('Error fetching downline:', error);
        res.status(500).json({ message: 'Error fetching downline', error: error.message });
    }
};
