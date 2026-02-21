const { Product, sequelize } = require('./models');

const addDemoProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const productsData = [
            {
                name: 'Quantum Energy Pendant',
                description: 'Experience balanced energy and improved focus with our scalar energy pendant. Made from volcanic minerals.',
                price: 150.00,
                original_price: 200.00,
                tax: '18%',
                shipping_cost: 0.00,
                category: 'Health',
                image_url: 'https://images.unsplash.com/photo-1615655406736-b37c4d29e3a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                status: 'active'
            },
            {
                name: 'Age-Defying Night Cream',
                description: 'Wake up to rejuvenated skin. Contains retinol and hyaluronic acid for maximum hydration.',
                price: 75.00,
                original_price: 95.00,
                tax: 'included',
                shipping_cost: 5.00,
                category: 'Beauty',
                image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                status: 'active'
            },
            {
                name: 'Superfood Green Powder',
                description: 'Daily greens to alkalize and detoxify your body. 30 servings per container.',
                price: 45.00,
                original_price: 60.00,
                tax: 'included',
                shipping_cost: 0.00,
                category: 'Health',
                image_url: 'https://images.unsplash.com/photo-1595855701123-96b5d233190b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                status: 'active'
            },
            {
                name: 'Crypto Trading Masterclass',
                description: 'Learn to trade cryptocurrencies like a pro. Lifetime access to video lessons and community.',
                price: 299.00,
                original_price: 499.00,
                tax: '18%',
                shipping_cost: 0.00, // Digital product
                category: 'Education',
                image_url: 'https://images.unsplash.com/photo-1621504450162-e15985449516?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                status: 'active'
            },
            {
                name: 'Smart Home Security Hub',
                description: 'Control all your smart devices from one central hub. Voice activated.',
                price: 129.00,
                original_price: 150.00,
                tax: 'included',
                shipping_cost: 0.00,
                category: 'Electronics',
                image_url: 'https://images.unsplash.com/photo-1558002038-1091a1661116?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                status: 'active'
            }
        ];

        console.log('Adding 5 new demo products...');
        await Product.bulkCreate(productsData);
        console.log('Successfully added 5 demo products!');

    } catch (error) {
        console.error('Error adding products:', error);
    } finally {
        await sequelize.close();
    }
};

addDemoProducts();
