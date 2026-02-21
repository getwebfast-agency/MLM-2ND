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
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
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
