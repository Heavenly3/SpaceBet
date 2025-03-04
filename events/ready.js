const { Events } = require('discord.js');
const { sequelize } = require('../models/User');
// const collectInterest = require('../scripts/interestCollector');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      await sequelize.sync();
      console.log('Database synchronized.');

      // setInterval(collectInterest, 30000);
    } catch (error) {
      console.error('Error synchronizing the database:', error);
    }
  },
};
