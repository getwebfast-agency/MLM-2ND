const { User, sequelize, ReferralClosure } = require('./models'); // Import from local index.js which handles initialization
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedNetwork = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Force sync to create tables if missing (and clear old data for a clean demo)
        await sequelize.sync({ force: true });
        console.log('Database synced & cleared.');

        // Helper to add closure entries
        const addClosure = async (user, sponsorId) => {
            // 1. Self-reference
            await ReferralClosure.create({ ancestor_id: user.id, descendant_id: user.id, depth: 0 });

            // 2. Copy ancestors from sponsor
            if (sponsorId) {
                const ancestors = await ReferralClosure.findAll({ where: { descendant_id: sponsorId } });
                for (const ancestor of ancestors) {
                    await ReferralClosure.create({
                        ancestor_id: ancestor.ancestor_id,
                        descendant_id: user.id,
                        depth: ancestor.depth + 1
                    });
                }
            }
        };

        // 1. Find or Create Admin
        let admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await User.create({
                id: uuidv4(),
                name: 'Admin User',
                email: 'admin@example.com',
                password_hash: hashedPassword,
                role: 'admin',
                referral_code: 'JOINSM',
                status: 'active'
            });
            await addClosure(admin, null);
        }
        console.log('Admin:', admin.name, 'Code:', admin.referral_code);

        // 2. Create 5 Direct Members under Admin
        // "faishal ahmad" should be one of them
        const directNames = [
            'Faishal Ahmad',
            'John Doe',
            'Jane Smith',
            'Mike Johnson',
            'Sarah Connor'
        ];

        const directMembers = [];

        for (const name of directNames) {
            const email = name.toLowerCase().replace(' ', '.') + '@example.com';
            // Check if exists to avoid duplicates on re-run
            let user = await User.findOne({ where: { email } });

            if (!user) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                user = await User.create({
                    id: uuidv4(),
                    name: name,
                    email: email,
                    password_hash: hashedPassword,
                    role: 'member',
                    referral_code: 'REF-' + name.toUpperCase().substring(0, 3) + Math.floor(Math.random() * 1000),
                    sponsor_id: admin.id,
                    status: 'active'
                });
                await addClosure(user, admin.id);
            } else {
                // Ensure sponsor is admin
                user.sponsor_id = admin.id;
                await user.save();
            }
            directMembers.push(user);
        }
        console.log(`Created/Verified ${directMembers.length} direct members.`);

        // 3. Create 2 Members under EACH of the 5 direct members
        for (const parent of directMembers) {
            for (let i = 1; i <= 2; i++) {
                const childName = `${parent.name.split(' ')[0]} Downline ${i}`;
                const email = `downline.${parent.name.split(' ')[0].toLowerCase()}.${i}@example.com`;

                let child = await User.findOne({ where: { email } });
                if (!child) {
                    const hashedPassword = await bcrypt.hash('123456', 10);
                    child = await User.create({
                        id: uuidv4(),
                        name: childName,
                        email: email,
                        password_hash: hashedPassword,
                        role: 'member',
                        referral_code: 'REF-' + Math.random().toString(36).substring(7).toUpperCase(),
                        sponsor_id: parent.id,
                        status: 'active'
                    });
                    await addClosure(child, parent.id);
                } else {
                    child.sponsor_id = parent.id;
                    await child.save();
                }
            }
        }
        console.log('Created 2 downlines for each direct member.');

        console.log('Network Seed Complete!');
        process.exit();

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedNetwork();
