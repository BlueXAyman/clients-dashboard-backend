const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Client = sequelize.define('Client', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    branch: {
      type: DataTypes.ENUM,
      values: ['TSDI', 'TSGE'],
      allowNull: false
    }
  });
  

module.exports = Client;
