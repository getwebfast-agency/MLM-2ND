const { User, sequelize } = require('./models');

async function findCode() {
    try {
        await sequelize.authenticate();
        const user = await User.findOne();
        if (user) {
            console.log('Referral Code:', user.referral_code);
        } else {
            console.log('No users found.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

findCode();
