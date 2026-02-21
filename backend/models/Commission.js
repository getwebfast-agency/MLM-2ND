const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Commission = sequelize.define('Commission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        comment: 'The user who earns the commission',
    },
    source_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        comment: 'The user who made the purchase',
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        comment: 'Depth level from source user',
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending',
    },
});

module.exports = Commission;
