const settings = require('../../../services/settings');
const wheel = require('../../../services/wheel');
const emojis = require('../../../config/emojis');
const { formatNumber } = require('../../../utils/format');
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

const MAX_REWARDS = 25;
const confirmed = (args) => args.at(-1) === 'yes';

module.exports = {
  icon: 'wheel',
  color: 'wheel',

  render(t) {
    const rewards = wheel.getRewards();
    const lines = rewards.map(
      (reward, i) => `\`${String(i + 1).padStart(2)}\` ${wheel.rewardLabel(reward, t)}`,
    );
    return {
      blocks: [
        settingLines(t, 'wheel'),
        `### ${emojis.money} ${t('panel.wheel.prizes')} (${rewards.length}/${MAX_REWARDS})\n${
          lines.length ? list(lines, t, 15) : t('panel.wheel.empty')
        }`,
      ],
      rows: [
        [
          editButton(t, 'wheel'),
          button('wheel', 'add', t('panel.wheel.add'), emojis.money, ButtonStyle.Success),
          button(
            'wheel',
            'resetPrizes',
            t('panel.wheel.resetPrizes'),
            emojis.reset,
            ButtonStyle.Danger,
          ),
        ],
        [
          picker(
            'wheel',
            'remove',
            t('panel.wheel.removePlaceholder'),
            rewards.map((reward, i) => ({
              label: `#${i + 1} ${reward.name ?? ''} ${formatNumber(reward.amount)}`.replace(
                /\s+/g,
                ' ',
              ),
              value: String(i),
            })),
          ),
        ],
      ],
    };
  },

  actions: {
    add(interaction, _args, t) {
      if (wheel.getRewards().length >= MAX_REWARDS) {
        return { error: t('managewheel.full', { max: MAX_REWARDS }) };
      }
      return {
        modal: modal('wheel', 'savePrize', t('panel.wheel.modalTitle')).addLabelComponents(
          textField('amount', t('panel.wheel.amountLabel'), {
            description: t('config.hints.coins'),
            max: 12,
          }),
          textField('label', t('panel.wheel.labelLabel'), { required: false, max: 50 }),
        ),
      };
    },

    savePrize(interaction, _args, t) {
      const raw = interaction.fields.getTextInputValue('amount').replace(/[,._\s]/g, '');
      if (!/^\d+$/.test(raw)) {
        return {
          error: t('config.invalid', {
            field: t('panel.wheel.amountLabel'),
            hint: t('config.hints.coins'),
          }),
        };
      }
      const reward = {
        name: interaction.fields.getTextInputValue('label').trim() || null,
        amount: Number(raw),
      };
      settings.set('wheel.rewards', [...wheel.getRewards(), reward]);
      return {
        banner: `${emojis.success} ${t('managewheel.added', { label: wheel.rewardLabel(reward, t) })}`,
      };
    },

    remove(interaction, _args, t) {
      const rewards = wheel.getRewards();
      const index = Number(interaction.values[0]);
      if (!rewards[index]) return { error: t('managewheel.missing') };
      const [removed] = rewards.splice(index, 1);
      settings.set('wheel.rewards', rewards);
      return {
        banner: `${emojis.success} ${t('managewheel.removed', { label: wheel.rewardLabel(removed, t) })}`,
      };
    },

    resetPrizes(interaction, args, t) {
      if (!confirmed(args)) {
        return {
          confirm: { action: 'resetPrizes' },
          banner: `${emojis.warning} ${t('panel.wheel.confirmReset')}`,
        };
      }
      settings.reset('wheel.rewards');
      return { banner: `${emojis.reset} ${t('managewheel.reset')}` };
    },
  },
};
