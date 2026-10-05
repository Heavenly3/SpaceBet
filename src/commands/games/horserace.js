const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const games = require('../../services/games');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { horserace: config } = require('../../config/games');
const { wait } = require('../../core/respond');
const { shuffle } = require('../../utils/random');

const TRACK_LENGTH = 12;
const PLACES = [emojis.first, emojis.second, emojis.third];
const horseName = (index) => `#${index + 1} ${config.horses[index]}`;

/** Renders the track for one animation frame (progress 0..1). */
function track(order, chosen, progress) {
  return config.horses
    .map((_, horse) => {
      // Horses that finish higher run slightly faster.
      const speed = 1 - order.indexOf(horse) * 0.06;
      const position = Math.min(TRACK_LENGTH, Math.round(TRACK_LENGTH * progress * speed));
      const lane = `${'·'.repeat(TRACK_LENGTH - position)}${emojis.horse}${'·'.repeat(position)}`;
      const marker = horse === chosen ? ` ${emojis.marker}` : '';
      return `\`${String(horse + 1).padStart(2)}\` ${emojis.finish}${lane}${marker}`;
    })
    .join('\n');
}

module.exports = {
  cooldown: 'horserace.cooldown',

  data: new SlashCommandBuilder()
    .setName('horserace')
    .setDescription('Bet on a horse in the Comet Derby.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Your bet — e.g. 500, 2.5k, half or all')
        .setRequired(true)
        .setMaxLength(20),
    )
    .addIntegerOption((option) =>
      option
        .setName('horse')
        .setDescription('The horse you back')
        .setRequired(true)
        .addChoices(...config.horses.map((_, index) => ({ name: horseName(index), value: index }))),
    ),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const chosen = interaction.options.getInteger('horse');
    const bet = games.placeBet(user, interaction.options.getString('bet'), 'horserace', t);
    if (!bet.ok) return interaction.reply(bet.reply);

    const order = shuffle(config.horses.map((_, index) => index));
    const place = order.indexOf(chosen) + 1;
    const result = games.settle(user.id, bet.amount, config.payouts[place] ?? 0);

    const frame = (progress) =>
      new ui.Card('horserace')
        .header(
          ui.featureTitle(t, 'horserace'),
          t('horserace.backed', { horse: horseName(chosen) }),
        )
        .divider()
        .text(track(order, chosen, progress))
        .toMessage();

    await interaction.reply(frame(0));
    for (const progress of [0.35, 0.7]) {
      await wait(1000);
      await interaction.editReply(frame(progress));
    }
    await wait(1000);

    const podium = order
      .slice(0, 3)
      .map((horse, i) => `${PLACES[i]} **${horseName(horse)}** · ×${config.payouts[i + 1]}`)
      .join('\n');

    const card = new ui.Card(games.outcomeColor(result.net))
      .header(
        ui.featureTitle(t, 'horserace', t('horserace.results')),
        t('horserace.finished', { horse: horseName(chosen), place }),
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .text(podium)
      .divider()
      .text(games.resultText(t, { stake: bet.amount, ...result }))
      .footer();

    await interaction.editReply(card.toMessage());
  },
};
