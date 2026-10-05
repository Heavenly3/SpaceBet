const { chatInputApplicationCommandMention } = require('discord.js');
const { guildId } = require('../config/env');
const log = require('./logger').child('mentions');

const ids = new Map();

/** Caches the IDs of the deployed commands so they can be mentioned. */
async function refresh(client) {
  try {
    const manager = guildId
      ? (await client.guilds.fetch(guildId)).commands
      : client.application.commands;
    const commands = await manager.fetch();
    ids.clear();
    for (const command of commands.values()) ids.set(command.name, command.id);
  } catch (error) {
    log.warn('Could not fetch application commands:', error.message);
  }
}

/** Clickable mention like </loan repay:123>, or `/loan repay` as fallback. */
function mention(fullName) {
  const [name, ...rest] = fullName.split(' ');
  const id = ids.get(name);
  if (!id) return `\`/${fullName}\``;
  return chatInputApplicationCommandMention(name, ...rest, id);
}

module.exports = { refresh, mention };
