const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const games = require('../../services/games');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { slots: config } = require('../../config/games');
const { wait } = require('../../core/respond');
const { pick } = require('../../utils/random');

function evaluate(reels) {
  const [a, b, c] = reels;
  if (a === b && b === c) {
    return a === config.jackpotSymbol
      ? { multiplier: config.payouts.jackpot, icon: emojis.jackpot, key: 'slots.jackpot' }
      : { multiplier: config.payouts.triple, icon: emojis.win, key: 'slots.triple' };
  }
  if (a === b || b === c || a === c) {
    return { multiplier: config.payouts.pair, icon: emojis.sparkle, key: 'slots.pair' };
  }
  return { multiplier: 0, icon: emojis.lose, key: 'slots.none' };
}

function machine(reels, revealed) {
  const shown = reels.map((symbol, i) => (i < revealed ? symbol : emojis.spinning));
  return `# ${shown.join('  ')}`;
}

module.exports = {
  cooldown: 'slots.cooldown',

  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Pull the lever of the Nebula slot machine.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Your bet — e.g. 500, 2.5k, half or all')
        .setRequired(true)
        .setMaxLength(20),
    ),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const bet = games.placeBet(user, interaction.options.getString('bet'), 'slots', t);
    if (!bet.ok) return interaction.reply(bet.reply);

    const reels = [pick(config.symbols), pick(config.symbols), pick(config.symbols)];
    const { multiplier, icon, key } = evaluate(reels);
    const result = games.settle(user.id, bet.amount, multiplier);

    const frame = (revealed) =>
      new ui.Card('slots')
        .header(ui.featureTitle(t, 'slots'), t('slots.spinning'))
        .divider()
        .text(machine(reels, revealed))
        .toMessage();

    await interaction.reply(frame(0));
    for (let revealed = 1; revealed < reels.length; revealed++) {
      await wait(800);
      await interaction.editReply(frame(revealed));
    }
    await wait(800);

    const card = new ui.Card(games.outcomeColor(result.net))
      .header(
        ui.featureTitle(t, 'slots'),
        `${icon} **${t(key)}**`,
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .text(machine(reels, reels.length))
      .divider()
      .text(games.resultText(t, { stake: bet.amount, ...result }))
      .footer(t('slots.paytable', config.payouts));

    await interaction.editReply(card.toMessage());
  },
};
