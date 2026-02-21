const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

const fixAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const targetEmail = 'faishalback@gmail.com';
        const targetCode = 'JOINSM';
        const targetPassword = '00';

        // 1. Find user by Referral Code (which caused the unique error)
        let user = await User.findOne({ where: { referral_code: targetCode } });

        if (user) {
            console.log(`Found user with code ${targetCode}: ${user.email}`);

            // Update details
            user.email = targetEmail;
            user.name = 'Admin User';
            user.role = 'admin';
            user.status = 'active';

            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(targetPassword, salt);

            await user.save();
            console.log('Updated existing Admin user parameters.');
        } else {
            console.log('Referral code not found. Checking email...');
            // Fallback: Check if email exists (unlikely given the error)
            user = await User.findOne({ where: { email: targetEmail } });
            if (user) {
                console.log('Found user by email. Updating...');
                user.referral_code = targetCode;
                user.role = 'admin';
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(targetPassword, salt);
                await user.save();
            } else {
                console.log('Creating brand new admin...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(targetPassword, salt);
                await User.create({
                    name: 'Admin User',
                    email: targetEmail,
                    password_hash: hashedPassword,
                    referral_code: targetCode,
                    role: 'admin',
                    status: 'active'
                });
            }
        }
        console.log('Admin account is ready.');

    } catch (error) {
        console.error('Error fixing admin:', error);
    } finally {
        await sequelize.close();
    }
};

fixAdmin();
