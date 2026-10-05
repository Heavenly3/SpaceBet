const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const loans = require('../../services/loans');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { coins, relativeTime } = require('../../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Show your balance or the balance of another member.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) => option.setName('user').setDescription('Member to check')),

  async execute(interaction, { t }) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    if (target.bot) return interaction.reply(ui.info(`${emojis.bot} ${t('common.botsNoAccount')}`));

    const account = economy.getAccount(target);
    const netWorth = account.wallet + account.bank;
    const rank = netWorth > 0 ? economy.rankOf(target.id) : null;
    const loan = loans.getLoan(target.id);

    const subtitle = [t('balance.subtitle', { user: target }), rank && t('balance.rank', { rank })]
      .filter(Boolean)
      .join(' · ');

    const card = new ui.Card(account.wallet < 0 ? 'danger' : 'economy')
      .header(ui.featureTitle(t, 'balance'), subtitle, target.displayAvatarURL({ size: 128 }))
      .divider()
      .fields([
        { name: `${emojis.wallet} ${t('common.wallet')}`, value: coins(account.wallet) },
        { name: `${emojis.bank} ${t('common.bank')}`, value: coins(account.bank) },
        { name: `${emojis.netWorth} ${t('common.netWorth')}`, value: coins(netWorth) },
        loan && {
          name: `${emojis.loan} ${t('balance.activeLoan')}`,
          value: t('balance.loanDue', {
            amount: coins(loan.amount_due),
            time: relativeTime(loan.due_at),
          }),
        },
      ])
      .footer();

    await interaction.reply(card.toMessage());
  },
};
