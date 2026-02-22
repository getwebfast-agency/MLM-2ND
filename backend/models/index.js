const sequelize = require('../config/db');
const User = require('./User');
const ReferralClosure = require('./ReferralClosure');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Commission = require('./Commission');
const Withdrawal = require('./Withdrawal');

// User Associations
User.hasMany(User, { as: 'referrals', foreignKey: 'sponsor_id' });
User.belongsTo(User, { as: 'sponsor', foreignKey: 'sponsor_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
User.hasMany(Commission, { foreignKey: 'user_id', as: 'earnings' });
User.hasMany(Commission, { foreignKey: 'source_user_id', as: 'generated_commissions' });

// Tree Associations
ReferralClosure.belongsTo(User, { as: 'descendant', foreignKey: 'descendant_id' });
ReferralClosure.belongsTo(User, { as: 'ancestor', foreignKey: 'ancestor_id' });

// Withdrawal Associations
Withdrawal.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Withdrawal, { foreignKey: 'user_id' });

// Order Associations
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
Order.hasMany(Commission, { foreignKey: 'order_id' });

// OrderItem Associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Commission Associations
Commission.belongsTo(User, { foreignKey: 'user_id', as: 'earner' });
Commission.belongsTo(User, { foreignKey: 'source_user_id', as: 'source' });
Commission.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
    sequelize,
    User,
    ReferralClosure,
    Product,
    Order,
    OrderItem,
    Commission,
    Withdrawal,
};
