const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { coins } = require('../../utils/format');
const { parseAmount } = require('../../utils/parse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Move money from your wallet into the bank.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount — e.g. 500, 2.5k, half or all')
        .setRequired(true)
        .setMaxLength(20),
    ),

  async execute(interaction, { t }) {
    const account = economy.getAccount(interaction.user);
    const amount = parseAmount(interaction.options.getString('amount'), account.wallet);

    if (amount === null) {
      return interaction.reply(
        ui.error(account.wallet > 0 ? t('common.invalidAmount') : t('common.emptyWallet')),
      );
    }
    if (!economy.move(interaction.user.id, 'wallet', 'bank', amount)) {
      return interaction.reply(
        ui.error(t('common.notEnoughWallet', { amount: coins(account.wallet) })),
      );
    }

    const updated = economy.findAccount(interaction.user.id);
    const card = new ui.Card('bank')
      .header(
        `${emojis.deposit} ${t('bank.depositTitle')}`,
        t('bank.depositBody', { amount: coins(amount) }),
      )
      .divider()
      .stats([
        { name: `${emojis.wallet} ${t('common.wallet')}`, value: coins(updated.wallet) },
        { name: `${emojis.bank} ${t('common.bank')}`, value: coins(updated.bank) },
      ])
      .footer(t('features.bank'));

    await interaction.reply(card.toMessage());
  },
};
