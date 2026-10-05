const { StringSelectMenuBuilder } = require('discord.js');
const settings = require('../../../services/settings');
const emojis = require('../../../config/emojis');
const { TYPES } = require('../../../config/settingsSchema');
const { LANGUAGES, translator } = require('../../../i18n');
const { updatePresence } = require('../../../core/presence');
const { actionId, button, settingLines, ButtonStyle } = require('../shared');

function languageMenu(t) {
  const current = settings.get('general.language');
  return new StringSelectMenuBuilder()
    .setCustomId(actionId('general', 'language'))
    .setPlaceholder(t('config.languagePlaceholder'))
    .addOptions(
      ['auto', ...LANGUAGES].map((value) => ({
        label: t(`config.languages.${value}`),
        description: value === 'auto' ? t('config.languages.autoDescription') : undefined,
        emoji: value === 'auto' ? emojis.galaxy : translator(value)('meta.flag'),
        value,
        default: value === current,
      })),
    );
}

module.exports = {
  icon: 'config',
  color: 'config',

  render(t) {
    return {
      blocks: [settingLines(t, 'general')],
      rows: [
        [languageMenu(t)],
        [button('general', 'reset', t('config.reset'), emojis.reset, ButtonStyle.Danger)],
      ],
    };
  },

  actions: {
    // The reply is rebuilt in the new language right away.
    language(interaction) {
      settings.set('general.language', TYPES.language.parse(interaction.values[0]) ?? 'auto');
      updatePresence(interaction.client);
      return { refresh: true, banner: (t) => `${emojis.success} ${t('config.languageSaved')}` };
    },

    reset(interaction) {
      settings.reset('general.language');
      updatePresence(interaction.client);
      return { refresh: true, banner: (t) => `${emojis.reset} ${t('config.restored')}` };
    },
  },
};
