const { randomBytes } = require('node:crypto');
const { Events, PermissionsBitField } = require('discord.js');
const ui = require('../ui');
const economy = require('../services/economy');
const { resolveLanguage, translator } = require('../i18n');
const { respond } = require('../core/respond');
const log = require('../core/logger').child('interactions');

/** Context handed to every handler: a translator in the reply language. */
function createContext(interaction) {
  const t = translator(resolveLanguage(interaction.locale));
  return { t, lang: t.lang };
}

async function handleError(interaction, error, context, t) {
  // Short reference shown to the user and logged, to match reports to logs.
  const ref = randomBytes(3).toString('hex').toUpperCase();
  log.error(`[${ref}] Error in ${context} (user ${interaction.user?.id}):`, error);
  if (!interaction.isRepliable()) return;
  try {
    await respond(interaction, ui.error(t('common.error', { ref })));
  } catch (replyError) {
    log.warn('Could not send the error message:', replyError.message);
  }
}

/** Admin-only commands also lock their buttons, menus and modals. */
function isAllowed(command, interaction) {
  if (!command.adminOnly) return true;
  const required = new PermissionsBitField(BigInt(command.json.default_member_permissions));
  return Boolean(interaction.memberPermissions?.has(required));
}

/** customId format: `<command>:<action>:<arg>:<arg>...` */
function parseCustomId(customId) {
  const [commandName, action, ...args] = customId.split(':');
  return { commandName, action, args };
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const { commands } = interaction.client;
    const ctx = createContext(interaction);

    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName);
      try {
        await command?.autocomplete?.(interaction, ctx);
      } catch (error) {
        log.error(`Autocomplete error in /${interaction.commandName}:`, error);
        if (!interaction.responded) await interaction.respond([]).catch(() => {});
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) {
        log.warn(`Unknown command /${interaction.commandName}. Run "npm run deploy".`);
        return;
      }
      log.debug(`/${interaction.commandName} by ${interaction.user.id} [${ctx.lang}]`);
      economy.rememberLocale(interaction.user, interaction.locale);
      try {
        await command.execute(interaction, ctx);
      } catch (error) {
        await handleError(interaction, error, `/${interaction.commandName}`, ctx.t);
      }
      return;
    }

    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const { commandName, action, args } = parseCustomId(interaction.customId);
      const command = commands.get(commandName);
      const handler = command?.components?.[action];
      if (!handler) {
        log.warn(`No component handler for "${interaction.customId}".`);
        return;
      }
      if (!isAllowed(command, interaction)) {
        await interaction.reply(ui.error(ctx.t('common.adminOnly')));
        return;
      }
      try {
        await handler(interaction, args, ctx);
      } catch (error) {
        await handleError(interaction, error, `component ${interaction.customId}`, ctx.t);
      }
    }
  },
};
