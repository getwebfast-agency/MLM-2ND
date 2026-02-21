const { sequelize, User, Product, ReferralClosure } = require('./models');

const checkData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const userCount = await User.count();
        const productCount = await Product.count();
        const closureCount = await ReferralClosure.count();

        console.log(`Users found: ${userCount}`);
        console.log(`Products found: ${productCount}`);
        console.log(`ReferralClosure entries found: ${closureCount}`);

        if (userCount > 0) {
            const users = await User.findAll({ limit: 5, attributes: ['id', 'name', 'email'] });
            // console.log('Sample Users:', JSON.stringify(users, null, 2));
        }

        if (productCount > 0) {
            const products = await Product.findAll({ limit: 5, attributes: ['id', 'name', 'status'] });
            console.log('Sample Products:', JSON.stringify(products, null, 2));
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await sequelize.close();
    }
};

checkData();
