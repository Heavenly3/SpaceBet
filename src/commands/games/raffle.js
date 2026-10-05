const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const raffle = require('../../services/raffle');
const settings = require('../../services/settings');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { raffle: config } = require('../../config/games');
const { coins, formatDuration, formatNumber, relativeTime } = require('../../utils/format');

const ticket = (number) => `\`${String(number).padStart(3, '0')}\``;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raffle')
    .setDescription('The Galactic Raffle — pick a number and win the pot.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('buy')
        .setDescription('Buy a ticket with a number from 000 to 999.')
        .addIntegerOption((option) =>
          option
            .setName('number')
            .setDescription('Your lucky number (0-999)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(config.maxNumber),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('info').setDescription('See the current pot, draw time and your tickets.'),
    ),

  async execute(interaction, { t }) {
    const { user } = interaction;
    economy.getAccount(user);

    if (interaction.options.getSubcommand() === 'buy') {
      const number = interaction.options.getInteger('number');
      const result = raffle.buyTicket(user.id, number, interaction.channelId);

      if (!result.ok) {
        return interaction.reply(
          result.reason === 'duplicate'
            ? ui.error(t('raffle.duplicate', { number: ticket(number) }))
            : ui.error(t('raffle.funds', { price: coins(settings.get('raffle.ticketPrice')) })),
        );
      }

      const card = new ui.Card('raffle')
        .header(
          `${emojis.ticket} ${t('raffle.boughtTitle')}`,
          t('raffle.boughtBody', { number: `**${ticket(number)}**`, price: coins(result.price) }),
        )
        .divider()
        .stats([
          { name: `${emojis.money} ${t('raffle.pot')}`, value: coins(result.state.pot) },
          {
            name: `${emojis.clock} ${t('raffle.draw')}`,
            value: relativeTime(result.state.draw_at),
          },
          {
            name: `${emojis.ticket} ${t('raffle.yourTickets')}`,
            value: raffle.ticketsOf(user.id).map(ticket).join(', '),
          },
        ])
        .footer(t('raffle.announce'));
      return interaction.reply(card.toMessage());
    }

    const state = raffle.getState();
    const mine = raffle.ticketsOf(user.id);
    const card = new ui.Card('raffle')
      .header(ui.featureTitle(t, 'raffle'), t('raffle.infoSubtitle'))
      .divider()
      .stats([
        { name: `${emojis.money} ${t('raffle.pot')}`, value: coins(state.pot) },
        {
          name: `${emojis.ticket} ${t('raffle.ticketPrice')}`,
          value: coins(settings.get('raffle.ticketPrice')),
        },
        { name: `${emojis.bill} ${t('raffle.sold')}`, value: formatNumber(raffle.ticketCount()) },
        {
          name: `${emojis.clock} ${t('raffle.draw')}`,
          value: state.draw_at
            ? relativeTime(state.draw_at)
            : t('raffle.afterFirst', {
                duration: formatDuration(settings.get('raffle.drawDelay')),
              }),
        },
        {
          name: `${emojis.raffle} ${t('raffle.yourTickets')}`,
          value: mine.length ? mine.map(ticket).join(', ') : t('common.none'),
        },
      ])
      .footer();
    await interaction.reply(card.toMessage());
  },
};
