const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const email = 'marathamall1@gmail.com';
        const password = 'Shailu@7387'; // Updated admin password
        const referral_code = 'JOINSM'; // User provided referral code
        const name = 'Admin User';

        // Check if user exists
        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('User exists. Updating to admin role...');
            user.role = 'admin';
            user.referral_code = referral_code;
            // Update password if needed (hashing)
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(password, salt);
            await user.save();
            console.log('User updated to Admin.');
        } else {
            console.log('Creating new Admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                password_hash: hashedPassword,
                referral_code,
                role: 'admin',
                status: 'active'
            });
            console.log('Admin user created.');
        }

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await sequelize.close();
    }
};

seedAdmin();
