const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const Account = require('./Account');
const Customer = require('./Customer');
const Order = require('./Order');
const Product = require('./Product');

// Relationships
Tenant.hasMany(Account); Account.belongsTo(Tenant);
Tenant.hasMany(Customer); Customer.belongsTo(Tenant);
Tenant.hasMany(Order); Order.belongsTo(Tenant);
Customer.hasMany(Order); Order.belongsTo(Customer);
Tenant.hasMany(Product); Product.belongsTo(Tenant);

module.exports = {
    sequelize,
    Tenant,
    Account,
    Customer,
    Order,
    Product
};
