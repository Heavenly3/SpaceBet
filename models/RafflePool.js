// models/RafflePool.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('./Raffle'); // Usa la conexión existente

const RafflePool = sequelize.define('RafflePool', {
  prize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500, // Valor inicial del pozo
  },
});

module.exports = { RafflePool };
