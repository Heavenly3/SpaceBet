const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wallet: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bank: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loanActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  loanAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loanInterest: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loanDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = { User, sequelize };
