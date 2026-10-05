const loans = require('../../../services/loans');
const economy = require('../../../services/economy');
const emojis = require('../../../config/emojis');
const { coins, formatNumber, relativeTime } = require('../../../utils/format');
const { button, editButton, list, picker, settingLines, ButtonStyle } = require('../shared');

const confirmed = (args) => args.at(-1) === 'yes';

module.exports = {
  icon: 'loan',
  color: 'loans',

  render(t) {
    const active = loans.listLoans();
    const name = (userId) => economy.findAccount(userId)?.username ?? userId;
    return {
      blocks: [
        settingLines(t, 'loans'),
        `### ${emojis.bill} ${t('manageloans.listTitle')} (${active.length})\n${
          active.length
            ? list(
                active.map(
                  (loan) =>
                    `<@${loan.user_id}> · ${coins(loan.amount_due)} · ${t('manageloans.due', { time: relativeTime(loan.due_at) })}`,
                ),
                t,
                10,
              )
            : `${emojis.galaxy} ${t('manageloans.empty')}`
        }`,
      ],
      rows: [
        [
          editButton(t, 'loans'),
          button('loans', 'reset', t('config.reset'), emojis.reset),
          button('loans', 'cancelAll', t('panel.loans.cancelAll'), emojis.card, ButtonStyle.Danger),
        ],
        [
          picker(
            'loans',
            'cancel',
            t('panel.loans.cancelPlaceholder'),
            active.map((loan) => ({
              label: name(loan.user_id),
              description: formatNumber(loan.amount_due),
              emoji: emojis.loan,
              value: loan.user_id,
            })),
          ),
        ],
      ],
    };
  },

  actions: {
    cancel(interaction, _args, t) {
      const userId = interaction.values[0];
      return {
        banner: loans.cancel(userId)
          ? `${emojis.success} ${t('manageloans.cancelled', { user: `<@${userId}>` })}`
          : `${emojis.warning} ${t('manageloans.none', { user: `<@${userId}>` })}`,
      };
    },

    cancelAll(interaction, args, t) {
      if (!confirmed(args)) {
        return {
          confirm: { action: 'cancelAll' },
          banner: `${emojis.warning} ${t('panel.loans.confirmCancelAll')}`,
        };
      }
      return {
        banner: `${emojis.success} ${t('manageloans.cancelledAll', { count: loans.cancelAll() })}`,
      };
    },
  },
};
