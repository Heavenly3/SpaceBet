const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const Raffle = sequelize.define('Raffle', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ticketPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  drawDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = { Raffle, sequelize };
