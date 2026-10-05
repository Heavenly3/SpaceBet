const fs = require('node:fs');
const path = require('node:path');
const { localizeCommand } = require('../i18n/localizeCommand');
const log = require('./logger').child('loader');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');
const EVENTS_DIR = path.join(__dirname, '..', 'events');

function jsFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => path.join(dir, entry.name));
}

/**
 * Loads every command module from src/commands/<category>/<name>.js.
 *
 * A command module exports:
 *   data          SlashCommandBuilder (English texts; Spanish ones come from i18n/commands)
 *   execute       (interaction, ctx) => Promise
 *   autocomplete? (interaction, ctx) => Promise
 *   components?   { [action]: (interaction, args, ctx) => Promise } for custom IDs
 *                 shaped `<command>:<action>:<args...>`
 *   cooldown?     setting key of its cooldown, shown in /help
 *
 * `ctx` is { t, lang }: a translator bound to the language of the reply.
 */
function loadCommands() {
  const commands = new Map();

  const categories = fs
    .readdirSync(COMMANDS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const category of categories) {
    for (const file of jsFiles(path.join(COMMANDS_DIR, category))) {
      const command = require(file);
      if (!command?.data || typeof command.execute !== 'function') {
        log.warn(`Skipping ${path.relative(COMMANDS_DIR, file)}: missing "data" or "execute".`);
        continue;
      }
      const { name } = command.data;
      if (commands.has(name)) throw new Error(`Duplicate command name "/${name}"`);
      command.category = category;
      // Final payload sent to Discord, with the Spanish translations added.
      command.json = localizeCommand(command.data.toJSON());
      command.adminOnly = Boolean(command.json.default_member_permissions);
      commands.set(name, command);
    }
  }

  return commands;
}

function registerEvents(client) {
  let count = 0;
  for (const file of jsFiles(EVENTS_DIR)) {
    const event = require(file);
    const handler = async (...args) => {
      try {
        await event.execute(...args);
      } catch (error) {
        log.error(`Unhandled error in "${event.name}" event:`, error);
      }
    };
    client[event.once ? 'once' : 'on'](event.name, handler);
    count++;
  }
  return count;
}

module.exports = { loadCommands, registerEvents };
