const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  shopifyDomain: { type: DataTypes.STRING, unique: true, allowNull: false },
  shopName: { type: DataTypes.STRING },
  accessToken: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Tenant;
