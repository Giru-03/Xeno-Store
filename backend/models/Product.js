const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    shopifyProductId: { type: DataTypes.BIGINT, allowNull: false },
    title: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) }
}, { indexes: [{ unique: true, fields: ['TenantId', 'shopifyProductId'] }] });

module.exports = Product;
