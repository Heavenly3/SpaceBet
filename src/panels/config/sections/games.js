const emojis = require('../../../config/emojis');
const { button, editButton, settingLines } = require('../shared');

module.exports = {
  icon: 'slots',
  color: 'slots',

  render(t) {
    return {
      blocks: [settingLines(t, 'games')],
      rows: [[editButton(t, 'games'), button('games', 'reset', t('config.reset'), emojis.reset)]],
    };
  },
};
