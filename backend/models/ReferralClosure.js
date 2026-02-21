const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReferralClosure = sequelize.define('ReferralClosure', {
    ancestor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    descendant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    depth: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    indexes: [
        { fields: ['ancestor_id'] },
        { fields: ['descendant_id'] },
    ],
});

module.exports = ReferralClosure;
