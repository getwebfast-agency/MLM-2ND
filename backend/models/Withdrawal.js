const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Withdrawal = sequelize.define('Withdrawal', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        }
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment_details: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    admin_remark: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Withdrawal;
