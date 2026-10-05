const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const settings = require('../../services/settings');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const games = require('../../config/games');
const { CATEGORIES, displayField } = require('../../config/settingsSchema');
const { mention } = require('../../core/commandMentions');
const { localizedDescription } = require('../../i18n/localizeCommand');
const { coins, formatDuration } = require('../../utils/format');

// Sections of the guide: which command folder they list, their look, and who sees them.
const SECTIONS = {
  economy: { icon: 'money', color: 'economy', category: 'economy' },
  games: { icon: 'slots', color: 'slots', category: 'games' },
  loans: { icon: 'loan', color: 'loans', category: 'loans' },
  shop: { icon: 'shop', color: 'shop', category: 'shop' },
  admin: { icon: 'config', color: 'config', category: 'admin', adminOnly: true },
  config: { icon: 'description', color: 'config' },
};

const COMMAND_ICONS = {
  balance: 'planet',
  deposit: 'deposit',
  withdraw: 'withdraw',
  pay: 'payment',
  work: 'work',
  collect: 'collect',
  dailywheel: 'wheel',
  rob: 'rob',
  leaderboard: 'rank',
  slots: 'slots',
  roulette: 'roulette',
  horserace: 'horse',
  keno: 'keno',
  raffle: 'raffle',
  loan: 'loan',
  shop: 'shop',
  buy: 'buy',
  use: 'consumable',
  inventory: 'inventory',
  help: 'help',
  config: 'config',
};

// Settings category of /config that affects each command.
const COMMAND_SETTINGS = {
  work: 'work',
  collect: 'collect',
  dailywheel: 'wheel',
  slots: 'games',
  roulette: 'games',
  horserace: 'games',
  keno: 'games',
  rob: 'games',
  loan: 'loans',
  raffle: 'raffle',
};

const discordLocale = (lang) => (lang === 'es' ? 'es-ES' : 'en-US');
const isAdmin = (interaction) =>
  Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
const icon = (name) => emojis[COMMAND_ICONS[name]] ?? emojis.help;

function visibleSections(admin) {
  return Object.entries(SECTIONS).filter(([, section]) => !section.adminOnly || admin);
}

function commandsOf(client, category, admin) {
  return [...client.commands.values()]
    .filter((command) => command.category === category && (admin || !command.adminOnly))
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}

function subcommandsOf(json) {
  return (json.options ?? []).filter(
    (option) => option.type === ApplicationCommandOptionType.Subcommand,
  );
}

/** Payout summary of a game, if the command is one. */
function payoutLine(t, name) {
  switch (name) {
    case 'slots':
      return t('help.payouts.slots', games.slots.payouts);
    case 'roulette':
      return t('help.payouts.roulette');
    case 'horserace': {
      const { 1: first, 2: second, 3: third } = games.horserace.payouts;
      return t('help.payouts.horserace', { first, second, third });
    }
    case 'keno': {
      const max = Math.max(...Object.values(games.keno.paytable).flatMap(Object.values));
      return t('help.payouts.keno', { max: max.toLocaleString('en-US') });
    }
    default:
      return null;
  }
}

function sectionMenu(t, admin, selected) {
  return new StringSelectMenuBuilder()
    .setCustomId('help:section')
    .setPlaceholder(t('help.placeholder'))
    .addOptions(
      visibleSections(admin).map(([value, section]) => ({
        label: t(`help.sections.${value}.label`),
        description: t(`help.sections.${value}.description`),
        emoji: emojis[section.icon],
        value,
        default: value === selected,
      })),
    );
}

function commandMenu(t, lang, commands, selected) {
  if (!commands.length) return null;
  return new StringSelectMenuBuilder()
    .setCustomId('help:command')
    .setPlaceholder(t('help.commandPlaceholder'))
    .addOptions(
      commands.slice(0, 25).map((command) => ({
        label: `/${command.data.name}`,
        description: localizedDescription(command.json, discordLocale(lang)).slice(0, 100),
        emoji: icon(command.data.name),
        value: command.data.name,
        default: command.data.name === selected,
      })),
    );
}

function renderHome(t, client, admin, ephemeral) {
  const steps = t('help.home.steps').map(
    (step, i) =>
      `${i + 1}. ${step
        .replace('{work}', mention('work'))
        .replace('{deposit}', mention('deposit'))
        .replace('{slots}', mention('slots'))
        .replace('{shop}', mention('shop'))}`,
  );

  return new ui.Card('help')
    .header(
      ui.featureTitle(t, 'help'),
      t('help.subtitle'),
      client.user.displayAvatarURL({ size: 128 }),
    )
    .text(t('help.home.intro'))
    .divider()
    .text(`### ${emojis.brand} ${t('help.home.quickStart')}\n${steps.join('\n')}`)
    .divider()
    .text(
      visibleSections(admin)
        .map(
          ([id, section]) =>
            `${emojis[section.icon]} **${t(`help.sections.${id}.label`)}** — ${t(`help.sections.${id}.description`)}`,
        )
        .join('\n'),
    )
    .text(`-# ${emojis.coin} ${t('help.home.amounts')}\n-# ${t('help.tip')}`)
    .actions([sectionMenu(t, admin)])
    .footer()
    .toMessage({ ephemeral });
}

function renderConfigGuide(t, card) {
  for (const [id, category] of Object.entries(CATEGORIES)) {
    const lines = category.fields.map(
      (field) =>
        `**${t(`config.fields.${id}.${field.id}.label`)}** · ${displayField(field, t)}\n-# ${t(`config.fields.${id}.${field.id}.help`)}`,
    );
    card.text(
      `### ${emojis[category.icon]} ${t(`config.categories.${id}.label`)}\n${lines.join('\n')}`,
    );
  }
}

function renderSection(t, lang, client, sectionId, admin, ephemeral) {
  const section = SECTIONS[sectionId];
  const card = new ui.Card(section.color).header(
    `${emojis[section.icon]} ${t(`help.sections.${sectionId}.label`)}`,
    t(`help.sections.${sectionId}.description`),
  );
  card.text(
    t(`help.sections.${sectionId}.intro`, {
      min: coins(games.minBet),
      command: mention('config'),
    }),
  );
  card.divider();

  let commands = [];
  if (sectionId === 'config') {
    renderConfigGuide(t, card);
  } else {
    commands = commandsOf(client, section.category, admin);
    const lines = commands.flatMap((command) => {
      const subcommands = subcommandsOf(command.json);
      if (!subcommands.length) {
        return `${icon(command.data.name)} ${mention(command.data.name)} — ${localizedDescription(command.json, discordLocale(lang))}`;
      }
      return subcommands.map(
        (sub) =>
          `${icon(command.data.name)} ${mention(`${command.data.name} ${sub.name}`)} — ${localizedDescription(sub, discordLocale(lang))}`,
      );
    });
    card.text(`### ${t('help.commandsTitle')}\n${lines.join('\n')}`);

    if (sectionId === 'games') {
      const payouts = ['slots', 'roulette', 'horserace', 'keno'].map(
        (name) => `${icon(name)} **${t(`features.${name}`)}** · ${payoutLine(t, name)}`,
      );
      card
        .divider()
        .text(`### ${emojis.money} ${t('help.sections.games.payouts')}\n${payouts.join('\n')}`);
    }
  }

  return card
    .actions([sectionMenu(t, admin, sectionId)], [commandMenu(t, lang, commands)].filter(Boolean))
    .footer(t('help.tip'))
    .toMessage({ ephemeral });
}

function optionLines(t, lang, options) {
  return (options ?? []).map((option) => {
    const optional = option.required ? '' : ` · *${t('help.optional')}*`;
    return `› \`${option.name}\` — ${localizedDescription(option, discordLocale(lang))}${optional}`;
  });
}

function renderCommand(t, lang, client, command, admin, ephemeral) {
  const { name } = command.data;
  const json = command.json;
  const sectionId =
    Object.entries(SECTIONS).find(([, section]) => section.category === command.category)?.[0] ??
    null;
  const color = SECTIONS[sectionId]?.color ?? 'help';

  const card = new ui.Card(color)
    .header(`${icon(name)} /${name}`, localizedDescription(json, discordLocale(lang)))
    .text(t(`help.commands.${name}.about`));

  // Usage: every subcommand (or the command itself) with its options.
  const subcommands = subcommandsOf(json);
  const usage = subcommands.length
    ? subcommands.map((sub) =>
        [
          `${mention(`${name} ${sub.name}`)} — ${localizedDescription(sub, discordLocale(lang))}`,
          ...optionLines(t, lang, sub.options),
        ].join('\n'),
      )
    : [[mention(name), ...optionLines(t, lang, json.options)].join('\n')];
  card.divider().text(`### ${t('help.usage')}\n${usage.join('\n\n')}`);

  const facts = [
    command.adminOnly && `${emojis.role} **${t('help.adminOnly')}**`,
    command.cooldown &&
      `${emojis.cooldown} **${t('help.cooldown')}** · ${formatDuration(settings.get(command.cooldown))}`,
    payoutLine(t, name) && `${emojis.money} ${payoutLine(t, name)}`,
    COMMAND_SETTINGS[name] &&
      `${emojis.config} ${t('help.configuredIn', { command: mention('config') })} → ${t(`config.categories.${COMMAND_SETTINGS[name]}.label`)}`,
  ].filter(Boolean);
  if (facts.length) card.divider().text(facts.join('\n'));

  const siblings = sectionId ? commandsOf(client, command.category, admin) : [];
  const rows = [[sectionMenu(t, admin, sectionId)]];
  const menu = commandMenu(t, lang, siblings, name);
  if (menu) rows.push([menu]);

  return card
    .actions(...rows)
    .footer(t('help.tip'))
    .toMessage({ ephemeral });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Guide to every command, game and setting of the bot.')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Open the help page of one command directly')
        .setAutocomplete(true),
    ),

  async autocomplete(interaction, { lang }) {
    const query = interaction.options.getFocused().toLowerCase().replace(/^\//, '');
    const admin = isAdmin(interaction);
    await interaction.respond(
      [...interaction.client.commands.values()]
        .filter((command) => (admin || !command.adminOnly) && command.data.name.includes(query))
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
        .slice(0, 25)
        .map((command) => ({
          name: `/${command.data.name} — ${localizedDescription(command.json, discordLocale(lang))}`.slice(
            0,
            100,
          ),
          value: command.data.name,
        })),
    );
  },

  async execute(interaction, { t, lang }) {
    const admin = isAdmin(interaction);
    const requested = interaction.options.getString('command')?.replace(/^\//, '').toLowerCase();

    if (requested) {
      const command = interaction.client.commands.get(requested);
      if (!command || (command.adminOnly && !admin)) {
        return interaction.reply(ui.error(t('help.unknownCommand', { name: requested })));
      }
      return interaction.reply(renderCommand(t, lang, interaction.client, command, admin, true));
    }

    await interaction.reply(renderHome(t, interaction.client, admin, true));
  },

  components: {
    async section(interaction, _args, { t, lang }) {
      const sectionId = interaction.values[0];
      const admin = isAdmin(interaction);
      if (!SECTIONS[sectionId] || (SECTIONS[sectionId].adminOnly && !admin)) {
        return interaction.update(renderHome(t, interaction.client, admin, false));
      }
      await interaction.update(renderSection(t, lang, interaction.client, sectionId, admin, false));
    },

    async command(interaction, _args, { t, lang }) {
      const admin = isAdmin(interaction);
      const command = interaction.client.commands.get(interaction.values[0]);
      if (!command || (command.adminOnly && !admin)) {
        return interaction.update(renderHome(t, interaction.client, admin, false));
      }
      await interaction.update(renderCommand(t, lang, interaction.client, command, admin, false));
    },
  },
};
