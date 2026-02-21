const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']],
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, original_price, tax, shipping_cost, referral_discount_percent, member_commission_percent } = req.body;
        let image_url = req.body.image_url; // Fallback to manual URL if no file

        if (req.file) {
            // If file uploaded, construct URL
            // Assuming server runs on localhost:5000 or use process.env.BASE_URL
            const protocol = req.protocol;
            const host = req.get('host');
            image_url = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image_url,
            original_price,
            tax,
            shipping_cost,
            referral_discount_percent: referral_discount_percent || 0,
            member_commission_percent: member_commission_percent || 0,
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
