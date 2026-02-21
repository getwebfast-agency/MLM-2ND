const { Product, sequelize } = require('./models');

const seedProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Verify products table exists and is accessable
        // We will just create products. Assuming table structure is fine.

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

        // Check if products exist before adding?
        // Or just wipe products table only?
        // Use truncate: true to wipe existing products to avoid duplicates if run multiple times.
        await Product.destroy({ where: {}, truncate: false });
        console.log('Cleared existing products.');

        await Product.bulkCreate(productsData);
        console.log('Products seeded successfully.');

    } catch (error) {
        console.error('Error seeding products:', error);
    } finally {
        await sequelize.close();
    }
};

seedProducts();
