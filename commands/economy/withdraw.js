const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw money from the bank.')
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription(
          'The amount to withdraw or type "all" to withdraw everything',
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    const amountInput = interaction.options.getString('amount');
    let amount;
    let user = await User.findOne({ where: { userId: interaction.user.id } });

    if (!user) {
      user = await User.create({
        userId: interaction.user.id,
        wallet: 0,
        bank: 0,
      });
    }

    if (amountInput.toLowerCase() === 'all') {
      amount = user.bank;
    } else {
      amount = parseInt(amountInput);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          content: 'Please enter a valid amount or "all".',
          ephemeral: true,
        });
      }
    }

    if (amount > user.bank) {
      return interaction.reply({
        content: `You don't have enough money in your bank to withdraw ${amount} <:disk:1309988409208475730>.`,
        ephemeral: true,
      });
    }

    user.bank -= amount;
    user.wallet += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('<:withdraw:1305561987417112648> Withdrawal Successful')
      .setDescription(
        `You have withdrawn **${amount} <:disk:1309988409208475730>** from your bank.`,
      )
      .addFields(
        {
          name: 'New Wallet Balance',
          value: `${user.wallet} <:disk:1309988409208475730>`,
          inline: true,
        },
        {
          name: 'New Bank Balance',
          value: `${user.bank} <:disk:1309988409208475730>`,
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
