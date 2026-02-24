const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function testRegistration() {
    try {
        const password = await bcrypt.hash('password123', 10);
        const newUser = await User.create({
            name: 'Test Phone User',
            email: null,
            phone: '9876543210' + Math.random(),
            password_hash: password,
            referral_code: 'TEST' + Math.floor(Math.random() * 10000),
            sponsor_id: null,
        });
        console.log('Success:', newUser.id);
    } catch (err) {
        console.error('Validation Error:', err.message);
        if (err.errors) {
            err.errors.forEach(e => console.error(e.message));
        }
    } finally {
        process.exit(0);
    }
}
testRegistration();
