const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmailOrNull(value) {
                if (value !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error('Must be a valid email string');
                }
            }
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    referral_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    sponsor_id: {
        type: DataTypes.UUID,
        allowNull: true, // Null for root admin
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member',
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended'),
        defaultValue: 'active',
    },
});

module.exports = User;
