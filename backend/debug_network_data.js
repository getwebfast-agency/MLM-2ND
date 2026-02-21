const { User, sequelize } = require('./models');

async function debugNetwork() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const users = await User.findAll({
            attributes: ['id', 'name', 'role', 'status', 'referral_code', 'sponsor_id']
        });

        console.log(`\nTotal Users: ${users.length}`);

        const nodes = users.map(u => ({ id: u.id, name: u.name, sponsor: u.sponsor_id }));
        console.log('First 5 Users:', JSON.stringify(nodes.slice(0, 5), null, 2));

        // Check for sponsor validity
        let orphans = 0;
        let validLinks = 0;
        let selfSponsor = 0;

        users.forEach(u => {
            if (!u.sponsor_id) {
                orphans++;
            } else {
                const sponsor = users.find(s => s.id === u.sponsor_id);
                if (sponsor) {
                    validLinks++;
                } else {
                    console.warn(`User ${u.id} (${u.name}) has sponsor_id ${u.sponsor_id} which does NOT exist in the fetched list.`);
                }

                if (u.id === u.sponsor_id) {
                    console.error(`User ${u.id} is sponsoring themselves!`);
                    selfSponsor++;
                }
            }
        });

        console.log(`\nStats:`);
        console.log(`- Orphans (Root/Top): ${orphans}`);
        console.log(`- Valid Links: ${validLinks}`);
        console.log(`- Self Sponsors (Error): ${selfSponsor}`);

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugNetwork();
