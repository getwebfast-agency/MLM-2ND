const { User, ReferralClosure, sequelize } = require('./models');
const { Op } = require('sequelize');

async function debugNetwork() {
    try {
        const emails = [
            'faishalback@gmail.com', // Admin
            'alice@example.com',     // Alice
            'bob@example.com',       // Bob
            'shivamcavil@gmail.com'  // Shivam
        ];

        const users = await User.findAll({
            where: { email: { [Op.in]: emails } },
            attributes: ['id', 'name', 'email']
        });

        for (const user of users) {
            console.log(`\n--- Debugging for ${user.name} (${user.email}) ---`);
            const closures = await ReferralClosure.findAll({
                where: { ancestor_id: user.id },
                include: [{ model: User, as: 'descendant', attributes: ['name', 'email'] }],
                order: [['depth', 'ASC']]
            });

            console.log(`Total Closure Rows (including self): ${closures.length}`);
            console.log(`Calculated Team Count (rows - 1): ${closures.length - 1}`);

            console.log('Descendants:');
            closures.forEach(c => {
                if (c.descendant_id === user.id) {
                    console.log(`  [Depth ${c.depth}] SELF`);
                } else {
                    console.log(`  [Depth ${c.depth}] ${c.descendant ? c.descendant.name : 'Unknown'} (${c.descendant_id})`);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugNetwork();
