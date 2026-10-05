const raffle = require('../../../services/raffle');
const emojis = require('../../../config/emojis');
const { coins, formatNumber, relativeTime } = require('../../../utils/format');
const { button, editButton, settingLines } = require('../shared');

module.exports = {
  icon: 'raffle',
  color: 'raffle',

  render(t) {
    const state = raffle.getState();
    return {
      blocks: [
        settingLines(t, 'raffle'),
        [
          `### ${emojis.ticket} ${t('panel.raffle.round')}`,
          `${emojis.money} ${t('raffle.pot')} · ${coins(state.pot)}`,
          `${emojis.bill} ${t('raffle.sold')} · ${formatNumber(raffle.ticketCount())}`,
          `${emojis.clock} ${t('raffle.draw')} · ${state.draw_at ? relativeTime(state.draw_at) : t('panel.raffle.waiting')}`,
        ].join('\n'),
      ],
      rows: [[editButton(t, 'raffle'), button('raffle', 'reset', t('config.reset'), emojis.reset)]],
    };
  },
};
