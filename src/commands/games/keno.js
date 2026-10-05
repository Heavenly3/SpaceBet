const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const games = require('../../services/games');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { keno: config } = require('../../config/games');
const { sample } = require('../../utils/random');

/** Parses "1, 7 23 42" into unique numbers, or returns an error key. */
function parseNumbers(input) {
  const numbers = input
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
  if (numbers.some((n) => !Number.isInteger(n) || n < 1 || n > config.poolSize)) {
    return { error: 'keno.badRange', vars: { max: config.poolSize } };
  }
  const unique = [...new Set(numbers)];
  if (unique.length !== numbers.length) return { error: 'keno.repeated' };
  if (unique.length < 1 || unique.length > config.maxSpots) {
    return { error: 'keno.badCount', vars: { max: config.maxSpots } };
  }
  return { numbers: unique.sort((a, b) => a - b) };
}

function paytableLine(t, spots) {
  return Object.entries(config.paytable[spots])
    .map(([hits, multiplier]) => `${t('keno.hits', { n: Number(hits) })} ×${multiplier}`)
    .join(' · ');
}

module.exports = {
  cooldown: 'keno.cooldown',

  data: new SlashCommandBuilder()
    .setName('keno')
    .setDescription(`Pick up to ${config.maxSpots} numbers and hope they are drawn.`)
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Your bet — e.g. 500, 2.5k, half or all')
        .setRequired(true)
        .setMaxLength(20),
    )
    .addStringOption((option) =>
      option
        .setName('numbers')
        .setDescription(
          `Up to ${config.maxSpots} numbers from 1-${config.poolSize}, e.g. "4 8 15 16 23 42"`,
        )
        .setMaxLength(60),
    )
    .addIntegerOption((option) =>
      option
        .setName('quickpick')
        .setDescription('Let the bot pick this many numbers for you')
        .setMinValue(1)
        .setMaxValue(config.maxSpots),
    ),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const input = interaction.options.getString('numbers');
    const quickPick = interaction.options.getInteger('quickpick');

    let picks;
    if (input) {
      const parsed = parseNumbers(input);
      if (parsed.error) return interaction.reply(ui.error(t(parsed.error, parsed.vars)));
      picks = parsed.numbers;
    } else {
      picks = sample(1, config.poolSize, quickPick ?? 5).sort((a, b) => a - b);
    }

    const bet = games.placeBet(user, interaction.options.getString('bet'), 'keno', t);
    if (!bet.ok) return interaction.reply(bet.reply);

    const drawn = new Set(sample(1, config.poolSize, config.drawSize));
    const hits = picks.filter((n) => drawn.has(n));
    const multiplier = config.paytable[picks.length][hits.length] ?? 0;
    const result = games.settle(user.id, bet.amount, multiplier);

    const board = [...drawn]
      .sort((a, b) => a - b)
      .map((n) => (picks.includes(n) ? `**[${n}]**` : `${n}`))
      .join(' ');

    const card = new ui.Card(games.outcomeColor(result.net))
      .header(
        ui.featureTitle(t, 'keno'),
        t('keno.summary', { hits: hits.length, picks: picks.length }),
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .fields([
        {
          name: t('keno.yours'),
          value: picks
            .map((n) => (drawn.has(n) ? `**${n}** ${emojis.success}` : `${n}`))
            .join(' · '),
        },
        { name: t('keno.drawn', { count: config.drawSize }), value: board },
      ])
      .divider()
      .text(games.resultText(t, { stake: bet.amount, ...result }))
      .footer(t('keno.paytable', { spots: picks.length, table: paytableLine(t, picks.length) }));

    await interaction.reply(card.toMessage());
  },
};
