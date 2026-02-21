const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    original_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    tax: {
        type: DataTypes.STRING, // "included" or "18%"
        defaultValue: 'included',
    },
    shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00, // 0 for free shipping
    },
    image_url: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    referral_discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
    },
    member_commission_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
    },
});

module.exports = Product;
