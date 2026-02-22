require('dotenv').config();
const { Order } = require('./models');
const { Op } = require('sequelize');

async function delete9999Sales() {
    try {
        console.log("Connecting to database and executing deletion...");

        // Let's delete anything with amount 9999, "9999", or "9999.00"
        const deletedCount = await Order.destroy({
            where: {
                total_amount: {
                    [Op.or]: [9999, '9999', '9999.00', 9999.00]
                }
            }
        });

        console.log(`Successfully deleted ${deletedCount} record(s) with amount 9999.`);

        // Double check what is left
        const remainingOrders = await Order.findAll({
            attributes: ['id', 'total_amount']
        });

        console.log("Remaining orders amounts:", remainingOrders.map(o => o.total_amount));

    } catch (err) {
        console.error("Deletion Error:", err);
    } finally {
        process.exit();
    }
}

delete9999Sales();
