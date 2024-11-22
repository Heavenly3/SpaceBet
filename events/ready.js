const { Events } = require('discord.js');
const { sequelize } = require('../models/User');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      await sequelize.sync();
      console.log('Database synchronized.');
    } catch (error) {
      console.error('Error synchronizing the database:', error);
    }
  },
};
