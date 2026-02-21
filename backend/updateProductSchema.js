const { sequelize } = require('./models');

async function updateProductSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Products');

        if (!tableInfo.referral_discount_percent) {
            await queryInterface.addColumn('Products', 'referral_discount_percent', {
                type: sequelize.Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00,
                allowNull: false,
            });
            console.log('Added referral_discount_percent column.');
        }

        if (!tableInfo.member_commission_percent) {
            await queryInterface.addColumn('Products', 'member_commission_percent', {
                type: sequelize.Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00,
                allowNull: false,
            });
            console.log('Added member_commission_percent column.');
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateProductSchema();
