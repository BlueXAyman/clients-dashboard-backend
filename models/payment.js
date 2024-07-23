const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Client = require('./client');

const Payment = sequelize.define('Payment', {
    startMonth: {
        type: DataTypes.INTEGER, // Use INTEGER for months (1-12)
        allowNull: false
    },
    startYear: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    endMonth: {
        type: DataTypes.INTEGER, // Use INTEGER for months (1-12)
        allowNull: false
    },
    endYear: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clientId: {
        type: DataTypes.INTEGER,
        references: {
            model: Client,
            key: 'id'
        }       
    },
    paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    paymentTime: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW
    }
});

Client.hasMany(Payment, { foreignKey: 'clientId' });
Payment.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = Payment;
