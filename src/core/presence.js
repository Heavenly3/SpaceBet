const { ActivityType } = require('discord.js');
const emojis = require('../config/emojis');
const settings = require('../services/settings');
const { translate } = require('../i18n');

/** Sets the bot status line in the configured language (English when automatic). */
function updatePresence(client) {
  const configured = settings.get('general.language');
  const lang = configured === 'auto' ? 'en' : configured;
  client.user.setActivity({
    type: ActivityType.Custom,
    name: 'custom',
    state: `${emojis.brand} ${translate(lang, 'status')}`,
  });
}

module.exports = { updatePresence };
