const {
    Order,
    OrderItem,
    Commission,
    sequelize
} = require('./models');
const { Op } = require('sequelize');

async function cleanupSales() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting cleanup of old sales...');

        // Get start of today (local time of user is relevant, but server time is usually UTC or system time)
        // Assuming server system time matches user expectation roughly, or just simple date comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log(`Deleting completed orders created before: ${today}`);

        const oldOrders = await Order.findAll({
            where: {
                status: 'completed',
                createdAt: { [Op.lt]: today }
            },
            attributes: ['id'],
            transaction: t
        });

        const orderIds = oldOrders.map(o => o.id);

        if (orderIds.length === 0) {
            console.log('No old sales found to delete.');
            await t.rollback();
            return;
        }

        console.log(`Found ${orderIds.length} orders to delete.`);

        // Delete Commissions
        const deletedCommissions = await Commission.destroy({
            where: { order_id: { [Op.in]: orderIds } },
            transaction: t
        });
        console.log(`Deleted ${deletedCommissions} commission records.`);

        // Delete OrderItems
        const deletedItems = await OrderItem.destroy({
            where: { order_id: { [Op.in]: orderIds } },
            transaction: t
        });
        console.log(`Deleted ${deletedItems} order items.`);

        // Delete Orders
        const deletedOrders = await Order.destroy({
            where: { id: { [Op.in]: orderIds } },
            transaction: t
        });
        console.log(`Deleted ${deletedOrders} orders.`);

        await t.commit();
        console.log('Cleanup completed successfully.');

    } catch (error) {
        await t.rollback();
        console.error('Error during cleanup:', error);
    } finally {
        await sequelize.close();
    }
}

cleanupSales();
