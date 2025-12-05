const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  shopifyCustomerId: { type: DataTypes.BIGINT, allowNull: false },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  totalSpent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
}, { indexes: [{ unique: true, fields: ['TenantId', 'shopifyCustomerId'] }] });

module.exports = Customer;
