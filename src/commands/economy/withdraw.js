const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { coins } = require('../../utils/format');
const { parseAmount } = require('../../utils/parse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Move money from the bank into your wallet.')
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
    const amount = parseAmount(interaction.options.getString('amount'), account.bank);

    if (amount === null) {
      return interaction.reply(
        ui.error(account.bank > 0 ? t('common.invalidAmount') : t('common.emptyBank')),
      );
    }
    if (!economy.move(interaction.user.id, 'bank', 'wallet', amount)) {
      return interaction.reply(
        ui.error(t('common.notEnoughBank', { amount: coins(account.bank) })),
      );
    }

    const updated = economy.findAccount(interaction.user.id);
    const card = new ui.Card('bank')
      .header(
        `${emojis.withdraw} ${t('bank.withdrawTitle')}`,
        t('bank.withdrawBody', { amount: coins(amount) }),
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
