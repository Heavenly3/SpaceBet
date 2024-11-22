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
  wallet: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bank: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = { User, sequelize };
