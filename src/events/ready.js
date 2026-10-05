const { Events } = require('discord.js');
const commandMentions = require('../core/commandMentions');
const { updatePresence } = require('../core/presence');
const scheduler = require('../jobs/scheduler');
const log = require('../core/logger').child('ready');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    log.info(`Logged in as ${client.user.tag} — serving ${client.guilds.cache.size} server(s).`);
    updatePresence(client);
    await commandMentions.refresh(client);
    scheduler.start(client);
  },
};
