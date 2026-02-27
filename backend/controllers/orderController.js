const { Order, OrderItem, Product, Commission, User, ReferralClosure, sequelize } = require('../models');
const { Op } = require('sequelize');

// Commission Configuration
// Level 1 (Direct Sponsor): 10%
// Level 2: 5%
// Level 3: 3%
// Level 4: 2%
// Level 5: 1%
const COMMISSION_RATES = {
    1: 0.002, // 0.2%
    2: 0.05,
    3: 0.03,
    4: 0.02,
    5: 0.01
};

exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        console.log('Creating order with body:', req.body);
        const userId = req.user.id;
        const { items, referralCode } = req.body; // items: [{ productId, quantity }], referralCode (optional)

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // 1. Calculate Total and Validate Products
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            console.log(`Processing item: ${item.productId}, qty: ${item.quantity}`);
            const product = await Product.findByPk(item.productId);
            if (!product) {
                await t.rollback();
                console.error(`Product not found: ${item.productId}`);
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            // Ensure price is a number
            const price = parseFloat(product.price);
            if (isNaN(price)) {
                await t.rollback();
                console.error(`Invalid price for product ${product.id}: ${product.price}`);
                return res.status(500).json({ message: 'Invalid product price configuration' });
            }

            const itemTotal = price * item.quantity;
            totalAmount += itemTotal;
            orderItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                price: price
            });
        }

        console.log('Total Amount:', totalAmount);

        // 2. Create Order (PENDING)
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'pending',
            referral_code: referralCode || null
        }, { transaction: t });

        // 3. Create Order Items
        const finalOrderItems = orderItemsData.map(item => ({ ...item, order_id: order.id }));
        await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

        await t.commit();
        console.log('Order created successfully:', order.id);

        res.status(201).json({
            message: 'Order placed successfully. Waiting for admin confirmation.',
            orderId: order.id
        });

    } catch (error) {
        await t.rollback();
        console.error('Order creation failed:', error);
        res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

exports.confirmOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, { include: [OrderItem] });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'completed') {
            await t.rollback();
            return res.status(400).json({ message: 'Order already completed' });
        }

        // 1. Update Status to delivery_pending (waiting for member to accept)
        order.status = 'delivery_pending';
        await order.save({ transaction: t });

        // 2. Distribute Commissions
        // Determine the starting point for commission distribution
        // If referral_code was used, commissions go to that referrer and their upline.
        // If NO referral_code, commissions go to the buyer's sponsor and their upline.

        let commissionReceiverId;

        if (order.referral_code) {
            const referrer = await User.findOne({ where: { referral_code: order.referral_code } });
            if (referrer) {
                commissionReceiverId = referrer.id;
                // Also, we might want to give a direct commission to this referrer?
                // For MLM structure simplicity in this project:
                // The referrer is considered Level 1.
            }
        }

        // Fallback: use buyer's sponsor if no valid referral code
        if (!commissionReceiverId) {
            const buyer = await User.findByPk(order.user_id);
            commissionReceiverId = buyer.sponsor_id;
        }

        if (commissionReceiverId) {
            // We need to trace up from commissionReceiverId
            // The commissionReceiverId IS the Level 1 benficiary.

            // Get ancestors of the "Start Node"
            const ancestors = await ReferralClosure.findAll({
                where: {
                    descendant_id: commissionReceiverId,
                    depth: { [Op.between]: [0, 4] }
                },
                include: [
                    { model: User, as: 'ancestor', attributes: ['id', 'role'] }
                ],
                transaction: t
            });

            const commissions = [];
            for (const relation of ancestors) {
                // SKIP ADMIN COMMISSIONS
                if (relation.ancestor && relation.ancestor.role === 'admin') {
                    continue;
                }

                // relation.depth 0 => Level 1
                // relation.depth 1 => Level 2
                const level = relation.depth + 1;
                const rate = COMMISSION_RATES[level];

                if (rate) {
                    const commissionAmount = order.total_amount * rate;
                    commissions.push({
                        user_id: relation.ancestor_id,
                        source_user_id: order.user_id,
                        order_id: order.id,
                        amount: commissionAmount,
                        level: level,
                        status: 'paid'
                    });
                }
            }
            if (commissions.length > 0) {
                await Commission.bulkCreate(commissions, { transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Order confirmed. Status set to Delivery Pending — awaiting member acceptance.', order });

    } catch (error) {
        await t.rollback();
        console.error('Confirm Order Error:', error);
        res.status(500).json({ message: 'Order confirmation failed', error: error.message });
    }
};

exports.acceptDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findByPk(id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user_id !== userId) return res.status(403).json({ message: 'Not your order' });
        if (order.status !== 'delivery_pending') {
            return res.status(400).json({ message: 'Order is not in delivery_pending state' });
        }

        order.status = 'completed';
        await order.save();

        res.json({ message: 'Delivery accepted. Order marked as completed.', order });
    } catch (error) {
        console.error('Accept Delivery Error:', error);
        res.status(500).json({ message: 'Failed to accept delivery', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'completed') {
            await t.rollback();
            return res.status(400).json({ message: 'Cannot cancel completed order' });
        }

        order.status = 'cancelled';
        await order.save({ transaction: t });

        await t.commit();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        await t.rollback();
        console.error('Cancel Order Error:', error);
        res.status(500).json({ message: 'Order cancellation failed', error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.id },
            include: [{ model: OrderItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

exports.getMyEarnings = async (req, res) => {
    try {
        const earnings = await Commission.findAll({
            where: { user_id: req.user.id },
            include: [
                { model: User, as: 'source', attributes: ['name', 'email'] },
                { model: Order, attributes: ['total_amount', 'createdAt'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate total
        const totalEarnings = earnings.reduce((sum, comm) => sum + parseFloat(comm.amount), 0);

        res.json({ total: totalEarnings, history: earnings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching earnings', error: error.message });
    }
};

exports.getDownlineOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get all descendants IDs
        const descendants = await ReferralClosure.findAll({
            where: {
                ancestor_id: userId,
                depth: { [Op.gt]: 0 } // Exclude self
            },
            attributes: ['descendant_id']
        });

        const descendantIds = descendants.map(d => d.descendant_id);

        if (descendantIds.length === 0) {
            return res.json([]);
        }

        // 2. Fetch orders for these users
        const orders = await Order.findAll({
            where: {
                user_id: { [Op.in]: descendantIds }
            },
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                },
                {
                    model: OrderItem,
                    include: [Product]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20 // Limit to recent 20 orders for performance
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching downline orders:', error);
        res.status(500).json({ message: 'Error fetching team orders', error: error.message });
    }
};
