const { REST, Routes } = require('discord.js');
const env = require('./config/env');
const { loadCommands } = require('./core/loader');
const log = require('./core/logger').child('deploy');

const args = new Set(process.argv.slice(2));
const isGlobal = args.has('--global') || !env.guildId;
const clear = args.has('--clear');

async function main() {
  const body = clear ? [] : [...loadCommands().values()].map((command) => command.json);
  const rest = new REST().setToken(env.token);
  const route = isGlobal
    ? Routes.applicationCommands(env.clientId)
    : Routes.applicationGuildCommands(env.clientId, env.guildId);

  log.info(
    `${clear ? 'Clearing' : `Deploying ${body.length}`} commands ${
      isGlobal ? 'globally' : `to guild ${env.guildId}`
    }...`,
  );
  const data = await rest.put(route, { body });
  log.info(`Done — ${data.length} commands registered.`);
}

main().catch((error) => {
  log.error('Deployment failed:', error);
  process.exitCode = 1;
});
