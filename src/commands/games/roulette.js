const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const games = require('../../services/games');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { roulette: config } = require('../../config/games');
const { wait } = require('../../core/respond');
const { randomBetween } = require('../../utils/random');

const RED = new Set(config.redNumbers);

function colorOf(number) {
  if (number === 0) return 'green';
  return RED.has(number) ? 'red' : 'black';
}

function wins(bet, number, pick) {
  if (number === 0) return bet === 'straight' && pick === 0;
  switch (bet) {
    case 'red':
    case 'black':
      return colorOf(number) === bet;
    case 'even':
      return number % 2 === 0;
    case 'odd':
      return number % 2 === 1;
    case 'low':
      return number <= 18;
    case 'high':
      return number >= 19;
    case 'dozen1':
    case 'dozen2':
    case 'dozen3':
      return Math.ceil(number / 12) === Number(bet.at(-1));
    case 'column1':
    case 'column2':
    case 'column3':
      return ((number - 1) % 3) + 1 === Number(bet.at(-1));
    case 'straight':
      return number === pick;
    default:
      return false;
  }
}

module.exports = {
  cooldown: 'roulette.cooldown',

  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Bet on the Orbital Roulette.')
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
        .setName('on')
        .setDescription('What you bet on')
        .setRequired(true)
        .addChoices(
          ...Object.entries(config.bets).map(([value, { label, multiplier }]) => ({
            name: `${label} — pays ×${multiplier}`,
            value,
          })),
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('number')
        .setDescription('The number to bet on (only for "Single number")')
        .setMinValue(0)
        .setMaxValue(36),
    ),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const betType = interaction.options.getString('on');
    const pick = interaction.options.getInteger('number');

    if (betType === 'straight' && pick === null) {
      return interaction.reply(ui.error(t('roulette.needsNumber')));
    }

    const bet = games.placeBet(user, interaction.options.getString('bet'), 'roulette', t);
    if (!bet.ok) return interaction.reply(bet.reply);

    const number = randomBetween(0, 36);
    const color = colorOf(number);
    const won = wins(betType, number, pick);
    const result = games.settle(user.id, bet.amount, won ? config.bets[betType].multiplier : 0);

    const betLabel =
      betType === 'straight' ? t('roulette.number', { n: pick }) : t(`roulette.bets.${betType}`);

    await interaction.reply(
      new ui.Card('roulette')
        .header(
          ui.featureTitle(t, 'roulette'),
          `${emojis.spinning} ${t('roulette.spinning', { bet: betLabel })}`,
        )
        .toMessage(),
    );
    await wait(1800);

    const card = new ui.Card(won ? 'success' : 'danger')
      .header(
        ui.featureTitle(t, 'roulette'),
        t('roulette.landed', {
          icon: emojis[color],
          number,
          color: t(`roulette.colors.${color}`),
        }),
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .text(
        won
          ? `${emojis.win} ${t('roulette.win', { bet: betLabel })}`
          : `${emojis.lose} ${t('roulette.lose', { bet: betLabel })}`,
      )
      .divider()
      .text(games.resultText(t, { stake: bet.amount, ...result }))
      .footer();

    await interaction.editReply(card.toMessage());
  },
};
