const { User, ReferralClosure, sequelize } = require('./models');
const { Op } = require('sequelize');

async function fixNetworkData() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting Network Data Fix...');

        // 1. Remove Duplicates
        console.log('Checking for duplicates...');
        const allClosures = await ReferralClosure.findAll({
            order: [['createdAt', 'DESC']] // Keep the latest? Or doesn't matter.
        });

        const seen = new Set();
        const duplicates = [];

        for (const c of allClosures) {
            const key = `${c.ancestor_id}-${c.descendant_id}-${c.depth}`;
            if (seen.has(key)) {
                duplicates.push(c.id);
            } else {
                seen.add(key);
            }
        }

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate rows. Deleting...`);
            await ReferralClosure.destroy({
                where: {
                    id: { [Op.in]: duplicates }
                },
                transaction: t
            });
            console.log('Duplicates deleted.');
        } else {
            console.log('No duplicates found.');
        }

        // 2. Ensure Self-References
        console.log('Checking for missing self-references...');
        const users = await User.findAll({ attributes: ['id'] });
        const missingSelfRefs = [];

        for (const user of users) {
            const hasSelf = await ReferralClosure.findOne({
                where: {
                    ancestor_id: user.id,
                    descendant_id: user.id,
                    depth: 0
                },
                transaction: t
            });

            if (!hasSelf) {
                missingSelfRefs.push({
                    ancestor_id: user.id,
                    descendant_id: user.id,
                    depth: 0
                });
            }
        }

        if (missingSelfRefs.length > 0) {
            console.log(`Found ${missingSelfRefs.length} users missing self-reference. Creating...`);
            await ReferralClosure.bulkCreate(missingSelfRefs, { transaction: t });
            console.log('Self-references created.');
        } else {
            console.log('All users have self-references.');
        }

        await t.commit();
        console.log('Network Data Fix Completed Successfully.');

    } catch (error) {
        await t.rollback();
        console.error('Error fixing network data:', error);
    } finally {
        await sequelize.close();
    }
}

fixNetworkData();
