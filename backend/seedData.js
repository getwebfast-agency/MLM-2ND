const { User, Product, Order, OrderItem, ReferralClosure, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // 1. Ensure Admin Exists (Already done by seedAdmin.js, but good to have reference)
        const adminEmail = 'marathamall1@gmail.com';
        let admin = await User.findOne({ where: { email: adminEmail } });

        if (!admin) {
            console.log('Admin not found, running seedAdmin first is recommended.');
            return;
        }

        console.log('Found Admin:', admin.name);

        // 2. Create Dummy Products
        const productsData = [
            {
                name: 'Premium Health Supplement',
                description: 'Boost your immunity with our premium supplement.',
                price: 1999.00,
                category: 'Health',
                image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Organic Skincare Set',
                description: 'Complete skincare routine for glowing skin.',
                price: 3499.00,
                category: 'Beauty',
                image_url: 'https://images.unsplash.com/photo-1556228578-8d8442c22666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Eco-Friendly Water Bottle',
                description: 'Stay hydrated with our sustainable bottle.',
                price: 799.00,
                category: 'Lifestyle',
                image_url: 'https://images.unsplash.com/photo-1602143407151-11115cd3068e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Digital Marketing Course',
                description: 'Master the art of online sales.',
                price: 9999.00,
                category: 'Education',
                image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Fitness Tracker Watch',
                description: 'Track your steps and heart rate.',
                price: 4999.00,
                category: 'Electronics',
                image_url: 'https://images.unsplash.com/photo-1576243345690-8e4b72893ea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];

        // Check if products exist to avoid duplicates
        // Check if products exist to avoid duplicates
        // For development/demo, we want to update prices to INR, so we might want to clear old ones or update them.
        // Let's wipe products and recreate them to ensure INR prices.

        await OrderItem.destroy({ where: {}, truncate: false }); // Clear order items first due to FK
        await Order.destroy({ where: {}, truncate: false }); // Clear orders
        await Product.destroy({ where: {}, truncate: false }); // Clear products

        await Product.bulkCreate(productsData);
        console.log('Dummy Products Created (INR).');

        const products = await Product.findAll();

        // 3. Create Dummy Members (Network)
        // Structure: Admin -> Alice -> Bob -> Charlie
        //                  -> Dave

        const memberData = [
            { name: 'Alice Smith', email: 'alice@example.com', password_hash: 'pass', referral_code: 'ALICE1', sponsor_code: 'JOINSM' },
            { name: 'Bob Jones', email: 'bob@example.com', password_hash: 'pass', referral_code: 'BOB123', sponsor_code: 'ALICE1' },
            { name: 'Charlie Day', email: 'charlie@example.com', password_hash: 'pass', referral_code: 'CHARLIE', sponsor_code: 'BOB123' },
            { name: 'Dave Wilson', email: 'dave@example.com', password_hash: 'pass', referral_code: 'DAVE01', sponsor_code: 'JOINSM' },
            { name: 'Eve Garden', email: 'eve@example.com', password_hash: 'pass', referral_code: 'EVE888', sponsor_code: 'ALICE1' }
        ];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt); // default password

        for (const m of memberData) {
            const exists = await User.findOne({ where: { email: m.email } });
            if (!exists) {
                const sponsor = await User.findOne({ where: { referral_code: m.sponsor_code } });
                if (sponsor) {
                    const newUser = await User.create({
                        name: m.name,
                        email: m.email,
                        password_hash: hashedPassword,
                        referral_code: m.referral_code,
                        sponsor_id: sponsor.id,
                        role: 'member',
                        status: 'active'
                    });

                    // Add to ReferralClosure (Simplified logic similar to register)
                    // In a real seed, we should ideally reuse the service logic, but here we duplicate for standalone script
                    // 1. Ancestors of sponsor
                    const ancestors = await ReferralClosure.findAll({ where: { descendant_id: sponsor.id } });
                    const closureEntries = ancestors.map(a => ({
                        ancestor_id: a.ancestor_id,
                        descendant_id: newUser.id,
                        depth: a.depth + 1
                    }));
                    // 2. Sponsor -> New User
                    closureEntries.push({ ancestor_id: sponsor.id, descendant_id: newUser.id, depth: 1 });
                    // 3. Self -> Self
                    closureEntries.push({ ancestor_id: newUser.id, descendant_id: newUser.id, depth: 0 });

                    await ReferralClosure.bulkCreate(closureEntries);
                    console.log(`Created member: ${m.name}`);
                }
            }
        }

        // 4. Create Dummy Orders & Sales
        const allUsers = await User.findAll({ where: { role: 'member' } });
        if (allUsers.length > 0 && products.length > 0) {

            // Generate some random orders
            for (let i = 0; i < 10; i++) {
                const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
                const randomProduct = products[Math.floor(Math.random() * products.length)];

                const order = await Order.create({
                    user_id: randomUser.id,
                    total_amount: randomProduct.price,
                    status: 'completed',
                    createdAt: new Date(new Date() - Math.floor(Math.random() * 1000000000)) // Random date in past
                });

                await OrderItem.create({
                    order_id: order.id,
                    product_id: randomProduct.id,
                    quantity: 1,
                    price: randomProduct.price
                });
            }
            console.log('Dummy Orders Created.');
        }

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await sequelize.close();
    }
};

seedData();
