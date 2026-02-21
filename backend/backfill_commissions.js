const {
    Order,
    User,
    Commission,
    ReferralClosure,
    sequelize
} = require('./models');
const { Op } = require('sequelize');

const COMMISSION_RATES = {
    1: 0.002, // 0.2%
    2: 0.05,
    3: 0.03,
    4: 0.02,
    5: 0.01
};

async function backfillCommissions() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting commission backfill...');

        // 1. Get all completed orders
        const orders = await Order.findAll({
            where: { status: 'completed' },
            transaction: t
        });

        console.log(`Found ${orders.length} completed orders.`);

        let createdCount = 0;

        for (const order of orders) {
            console.log(`Processing Order ID: ${order.id}, Amount: ${order.total_amount}, Ref: ${order.referral_code}`);

            // Check if commissions already exist for this order
            const existingCommissions = await Commission.count({
                where: { order_id: order.id },
                transaction: t
            });

            if (existingCommissions > 0) {
                console.log(`- Commissions already exist for order ${order.id}. Skipping.`);
                continue;
            }

            // Logic to determine commission receiver (Level 1)
            let commissionReceiverId;

            if (order.referral_code) {
                const referrer = await User.findOne({
                    where: { referral_code: order.referral_code },
                    transaction: t
                });
                if (referrer) {
                    commissionReceiverId = referrer.id;
                } else {
                    console.log(`- Referral code ${order.referral_code} not found. Checking buyer sponsor.`);
                }
            }

            if (!commissionReceiverId) {
                const buyer = await User.findByPk(order.user_id, { transaction: t });
                if (buyer && buyer.sponsor_id) {
                    commissionReceiverId = buyer.sponsor_id;
                }
            }

            if (!commissionReceiverId) {
                console.log(`- No beneficiary found for order ${order.id}. Skipping.`);
                continue;
            }

            console.log(`- Commission Start Node (Level 1): ${commissionReceiverId}`);

            const commissions = [];

            // 1. Level 1: Direct Referrer (0.2%)
            // This ensures the direct referrer gets paid even if closure table doesn't have self-reference
            const level1Rate = COMMISSION_RATES[1]; // 0.002
            const level1Amount = parseFloat(order.total_amount) * level1Rate;

            commissions.push({
                id: require('crypto').randomUUID(),
                user_id: commissionReceiverId,
                source_user_id: order.user_id,
                order_id: order.id,
                amount: level1Amount,
                level: 1,
                status: 'paid',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`-- Level 1: User ${commissionReceiverId}, Rate ${level1Rate}, Amount ${level1Amount}`);

            // 2. Level 2+: Ancestors
            // We search for ancestors of the referrer.
            // In closure table:
            // ancestor -> descendant
            // depth 1 means ancestor is parent of descendant.
            // If descendant is Level 1, then ancestor (depth 1) is Level 2.

            const ancestors = await ReferralClosure.findAll({
                where: {
                    descendant_id: commissionReceiverId,
                    depth: { [Op.between]: [1, 4] }
                },
                transaction: t
            });

            for (const relation of ancestors) {
                const level = relation.depth + 1; // depth 1 -> Level 2
                const rate = COMMISSION_RATES[level];

                if (rate) {
                    const commissionAmount = parseFloat(order.total_amount) * rate;
                    console.log(`-- Level ${level}: User ${relation.ancestor_id}, Rate ${rate}, Amount ${commissionAmount}`);

                    commissions.push({
                        id: require('crypto').randomUUID(),
                        user_id: relation.ancestor_id,
                        source_user_id: order.user_id,
                        order_id: order.id,
                        amount: commissionAmount,
                        level: level,
                        status: 'paid',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }

            if (commissions.length > 0) {
                await Commission.bulkCreate(commissions, { transaction: t });
                createdCount += commissions.length;
                console.log(`- Created ${commissions.length} commission records.`);
            }
        }

        await t.commit();
        console.log(`Backfill completed. Total commissions created: ${createdCount}`);

    } catch (error) {
        await t.rollback();
        console.error('Backfill failed:', error);
    } finally {
        await sequelize.close();
    }
}

backfillCommissions();
