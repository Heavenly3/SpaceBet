const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { coins } = require('../../utils/format');
const { parseAmount } = require('../../utils/parse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send money from your wallet to another member.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) =>
      option.setName('user').setDescription('Who receives the money').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount — e.g. 500, 2.5k, half or all')
        .setRequired(true)
        .setMaxLength(20),
    ),

  async execute(interaction, { t }) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) return interaction.reply(ui.error(t('pay.self')));
    if (target.bot) return interaction.reply(ui.error(t('pay.bot')));

    const sender = economy.getAccount(interaction.user);
    economy.getAccount(target);
    const amount = parseAmount(interaction.options.getString('amount'), sender.wallet);

    if (amount === null) return interaction.reply(ui.error(t('common.invalidAmount')));
    if (!economy.transfer(interaction.user.id, target.id, amount)) {
      return interaction.reply(
        ui.error(t('common.notEnoughWallet', { amount: coins(sender.wallet) })),
      );
    }

    const card = new ui.Card('economy')
      .header(
        `${emojis.payment} ${t('pay.title')}`,
        t('pay.body', { sender: interaction.user, amount: coins(amount), target }),
      )
      .divider()
      .stats([
        {
          name: `${emojis.wallet} ${t('common.yourWallet')}`,
          value: coins(economy.findAccount(interaction.user.id).wallet),
        },
      ])
      .footer(t('features.bank'));

    const message = card.toMessage();
    message.allowedMentions = { users: [target.id] };
    await interaction.reply(message);
  },
};
