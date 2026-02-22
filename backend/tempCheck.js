require('dotenv').config();
const { Order } = require('./models');

async function checkOrders() {
    try {
        const orders = await Order.findAll();
        for (let order of orders) {
            console.log(`Order ID: ${order.id}, Amount: ${order.total_amount}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkOrders();
