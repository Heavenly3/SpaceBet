const { Client, GatewayIntentBits, Partials } = require('discord.js');
const env = require('./config/env');
const database = require('./database');
const scheduler = require('./jobs/scheduler');
const { loadCommands, registerEvents } = require('./core/loader');
const log = require('./core/logger');

database.migrate();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.commands = loadCommands();
const eventCount = registerEvents(client);
log.info(`Loaded ${client.commands.size} commands and ${eventCount} events.`);

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info(`${signal} received, shutting down...`);
  scheduler.stop();
  await client.destroy().catch(() => {});
  database.close();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => log.error('Unhandled rejection:', error));
process.on('uncaughtException', (error) => log.error('Uncaught exception:', error));

client.login(env.token).catch((error) => {
  log.error('Failed to log in:', error.message);
  database.close();
  process.exit(1);
});
