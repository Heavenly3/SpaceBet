const { Events } = require('discord.js');
const { sequelize } = require('../models/User');
const collectInterest = require('../scripts/interestCollector'); // Importa el script de cobro

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      await sequelize.sync();
      console.log('Database synchronized.');

      // Ejecuta el script de cobro cada 30 segundos
      setInterval(collectInterest, 30000);
    } catch (error) {
      console.error('Error synchronizing the database:', error);
    }
  },
};
