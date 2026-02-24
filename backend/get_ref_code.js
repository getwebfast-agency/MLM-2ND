const { User } = require('./models');
async function run() {
    const admin = await User.findOne({ where: { role: 'admin' } });
    console.log('Admin ref code:', admin ? admin.referral_code : 'Not found');
    process.exit(0);
}
run();
