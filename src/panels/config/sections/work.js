const settings = require('../../../services/settings');
const work = require('../../../services/work');
const emojis = require('../../../config/emojis');
const { truncate } = require('../../../utils/format');
const {
  button,
  editButton,
  list,
  modal,
  picker,
  settingLines,
  textField,
  ButtonStyle,
} = require('../shared');

const MAX_MESSAGES = 50;
const confirmed = (args) => args.at(-1) === 'yes';

module.exports = {
  icon: 'work',
  color: 'work',

  render(t) {
    const messages = work.getMessages(t);
    const lines = messages.map(
      (message, i) => `\`${String(i + 1).padStart(2)}\` ${truncate(message, 120)}`,
    );
    return {
      blocks: [
        settingLines(t, 'work'),
        `### ${emojis.description} ${t('panel.work.messages')} (${messages.length}/${MAX_MESSAGES})\n${
          lines.length ? list(lines, t) : t('managework.noMessages')
        }${settings.isCustom('work.messages') ? '' : `\n-# ${t('managework.usingDefaults')}`}`,
      ],
      rows: [
        [
          editButton(t, 'work'),
          button('work', 'add', t('panel.work.add'), emojis.edit, ButtonStyle.Success),
          button('work', 'reset', t('config.reset'), emojis.reset, ButtonStyle.Danger),
        ],
        [
          picker(
            'work',
            'remove',
            t('panel.work.removePlaceholder'),
            messages.map((message, i) => ({ label: `#${i + 1} ${message}`, value: String(i) })),
          ),
        ],
      ],
    };
  },

  actions: {
    add(interaction, _args, t) {
      if (work.getMessages(t).length >= MAX_MESSAGES) {
        return { error: t('managework.full', { max: MAX_MESSAGES }) };
      }
      return {
        modal: modal('work', 'saveMessage', t('panel.work.modalTitle')).addLabelComponents(
          textField('message', t('panel.work.messageLabel'), {
            description: t('panel.work.messageHint'),
            paragraph: true,
            max: 300,
          }),
        ),
      };
    },

    saveMessage(interaction, _args, t) {
      const messages = work.getMessages(t);
      settings.set('work.messages', [
        ...messages,
        interaction.fields.getTextInputValue('message').trim(),
      ]);
      return { banner: `${emojis.success} ${t('managework.added', { n: messages.length + 1 })}` };
    },

    remove(interaction, _args, t) {
      const messages = work.getMessages(t);
      const index = Number(interaction.values[0]);
      if (!messages[index]) return { error: t('managework.missing') };
      const [removed] = messages.splice(index, 1);
      settings.set('work.messages', messages);
      return {
        banner: `${emojis.success} ${t('managework.removed', { message: truncate(removed, 200) })}`,
      };
    },

    reset(interaction, args, t) {
      if (!confirmed(args)) {
        return {
          confirm: { action: 'reset' },
          banner: `${emojis.warning} ${t('panel.work.confirmReset')}`,
        };
      }
      settings.reset('work.messages', 'work.range', 'work.cooldown');
      return { banner: `${emojis.reset} ${t('managework.reset')}` };
    },
  },
};
