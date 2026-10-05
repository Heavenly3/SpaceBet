const {
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} = require('discord.js');
const economy = require('../../services/economy');
const loans = require('../../services/loans');
const settings = require('../../services/settings');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins, formatDuration, fullTime, relativeTime } = require('../../utils/format');
const { parseAmount } = require('../../utils/parse');

function statusCard(t, loan, wallet) {
  const dueSoon = loan.due_at - Date.now() < 60 * 60 * 1000;
  const canRepay = wallet >= loan.amount_due;
  return new ui.Card(dueSoon ? 'warning' : 'loans')
    .header(`${emojis.loan} ${t('loans.statusTitle')}`, t('loans.statusSubtitle'))
    .divider()
    .fields([
      { name: `${emojis.money} ${t('loans.borrowed')}`, value: coins(loan.principal) },
      { name: `${emojis.interest} ${t('loans.interest')}`, value: `${loan.interest_rate}%` },
      { name: `${emojis.bill} ${t('loans.amountDue')}`, value: coins(loan.amount_due) },
      {
        name: `${emojis.due} ${t('loans.due')}`,
        value: `${fullTime(loan.due_at)} (${relativeTime(loan.due_at)})`,
      },
    ])
    .actions([
      new ButtonBuilder()
        .setCustomId(`loan:repay:${loan.user_id}`)
        .setLabel(t('loans.repayButton'))
        .setEmoji(emojis.card)
        .setStyle(ButtonStyle.Success)
        .setDisabled(!canRepay),
    ])
    .footer(canRepay ? t('features.loans') : t('loans.cannotRepayYet'));
}

/** @returns {{ ok: boolean, message: object }} */
function repay(t, userId) {
  const loan = loans.getLoan(userId);
  if (!loan) return { ok: false, message: ui.info(t('loans.noLoan')) };
  if (!loans.repay(userId)) {
    return {
      ok: false,
      message: ui.error(t('loans.needToRepay', { amount: coins(loan.amount_due) })),
    };
  }
  const message = new ui.Card('success')
    .header(
      `${emojis.success} ${t('loans.repaidTitle')}`,
      t('loans.repaidBody', { amount: coins(loan.amount_due) }),
    )
    .divider()
    .stats([
      {
        name: `${emojis.wallet} ${t('common.wallet')}`,
        value: coins(economy.findAccount(userId).wallet),
      },
    ])
    .footer(t('features.loans'))
    .toMessage();
  return { ok: true, message };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loan')
    .setDescription('Borrow coins from the Stellar Bank.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((sub) =>
      sub
        .setName('request')
        .setDescription('Request a new loan.')
        .addStringOption((option) =>
          option
            .setName('amount')
            .setDescription('How much to borrow — e.g. 5000 or 10k')
            .setRequired(true)
            .setMaxLength(20),
        ),
    )
    .addSubcommand((sub) => sub.setName('status').setDescription('Check your active loan.'))
    .addSubcommand((sub) => sub.setName('repay').setDescription('Repay your loan in full.')),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const account = economy.getAccount(user);
    const subcommand = interaction.options.getSubcommand();
    const maxAmount = settings.get('loan.maxAmount');

    if (subcommand === 'status') {
      const loan = loans.getLoan(user.id);
      if (!loan) {
        return interaction.reply(
          ui.info(
            t('loans.none', { max: coins(maxAmount), rate: settings.get('loan.interestRate') }),
          ),
        );
      }
      return interaction.reply(statusCard(t, loan, account.wallet).toMessage({ ephemeral: true }));
    }

    if (subcommand === 'repay') return interaction.reply(repay(t, user.id).message);

    if (loans.getLoan(user.id)) {
      return interaction.reply(ui.error(t('loans.already', { command: mention('loan repay') })));
    }
    if (account.wallet < 0 || account.bank < 0) {
      return interaction.reply(ui.error(t('loans.negative')));
    }
    const amount = parseAmount(interaction.options.getString('amount'), maxAmount);
    if (amount === null || amount > maxAmount) {
      return interaction.reply(ui.error(t('loans.range', { max: coins(maxAmount) })));
    }

    const loan = loans.takeLoan(user.id, amount);
    const card = new ui.Card('loans')
      .header(
        `${emojis.success} ${t('loans.approvedTitle')}`,
        t('loans.approvedBody', { amount: coins(amount) }),
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .fields([
        { name: `${emojis.interest} ${t('loans.interest')}`, value: `${loan.interest_rate}%` },
        { name: `${emojis.bill} ${t('loans.amountDue')}`, value: coins(loan.amount_due) },
        {
          name: `${emojis.due} ${t('loans.due')}`,
          value: t('loans.term', {
            time: relativeTime(loan.due_at),
            duration: formatDuration(settings.get('loan.duration')),
          }),
        },
      ])
      .footer(t('loans.footer'));

    await interaction.reply(card.toMessage());
  },

  components: {
    async repay(interaction, [ownerId], { t }) {
      if (interaction.user.id !== ownerId) return interaction.reply(ui.error(t('loans.notYours')));
      const { ok, message } = repay(t, ownerId);
      // On success the status panel is replaced by the receipt.
      return ok ? interaction.update(message) : interaction.reply(message);
    },
  },
};
