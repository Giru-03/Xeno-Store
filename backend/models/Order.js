const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  shopifyOrderId: { type: DataTypes.BIGINT, allowNull: false },
  shopifyOrderNumber: { type: DataTypes.STRING },
  totalPrice: { type: DataTypes.DECIMAL(10, 2) },
  financialStatus: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE }
}, { indexes: [{ unique: true, fields: ['TenantId', 'shopifyOrderId'] }] });

module.exports = Order;
