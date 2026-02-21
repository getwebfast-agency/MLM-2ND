const { User, ReferralClosure, sequelize } = require('./models');

const debugUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        console.log('Testing User.findAndCountAll with include: sponsor...');
        const { count, rows } = await User.findAndCountAll({
            attributes: ['id', 'name', 'email', 'role', 'status', 'referral_code', 'createdAt', 'sponsor_id'],
            include: [
                { model: User, as: 'sponsor', attributes: ['name', 'referral_code'] }
            ],
            limit: 5
        });
        console.log(`Found ${count} users.`);

        if (rows.length > 0) {
            console.log('First user:', JSON.stringify(rows[0].toJSON(), null, 2));

            // Test ReferralClosure count
            const user = rows[0];
            const totalDownline = await ReferralClosure.count({ where: { ancestor_id: user.id } }) - 1;
            console.log(`Downline for ${user.name}: ${totalDownline}`);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    } finally {
        await sequelize.close();
    }
};

debugUsers();
