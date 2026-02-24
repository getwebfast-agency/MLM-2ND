const { User } = require('./models');

async function debugProd() {
    try {
        const users = await User.findAll({ attributes: ['id', 'email', 'phone'] });
        console.log(`Total users: ${users.length}`);

        // Try to reproduce the validation error exactly
        const newUser = User.build({
            name: 'Test Phone User',
            email: null,
            phone: '1231231239', // completely random
            password_hash: 'hash',
            referral_code: 'TEST999',
            sponsor_id: null,
        });

        await newUser.validate();
        console.log('Validation passed!');
    } catch (err) {
        console.error('Validation Error Details:');
        if (err.errors) {
            err.errors.forEach(e => console.error(e.message));
        } else {
            console.error(err.message);
        }
    } finally {
        process.exit(0);
    }
}
debugProd();
