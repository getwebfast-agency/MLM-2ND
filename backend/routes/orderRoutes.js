const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getMyEarnings } = require('../controllers/orderController');

router.use(authenticateToken);

router.post('/orders', createOrder);
router.get('/orders', getMyOrders);
router.put('/orders/:id/confirm', require('../controllers/orderController').confirmOrder);
router.put('/orders/:id/cancel', require('../controllers/orderController').cancelOrder);
router.get('/team-orders', require('../controllers/orderController').getDownlineOrders);
router.get('/commissions', getMyEarnings); // Could be separate route file but grouping for simplicity

// Admin route to get all pending orders (can be moved to adminRoutes)
router.get('/all-orders', async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const { Order, User, Product, OrderItem } = require('../models');
        const orders = await Order.findAll({
            where,
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: OrderItem, include: [Product] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders' });
    }
});

module.exports = router;
