const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer money to another user.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to pay')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The amount of money to transfer')
        .setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    const sender = interaction.user;

    if (target.id === sender.id) {
      return interaction.reply({
        content: 'You cannot pay yourself.',
        ephemeral: true,
      });
    }

    let senderData = await User.findOne({ where: { userId: sender.id } });
    let targetData = await User.findOne({ where: { userId: target.id } });

    if (!senderData) {
      senderData = await User.create({ userId: sender.id, wallet: 0, bank: 0 });
    }

    if (!targetData) {
      targetData = await User.create({ userId: target.id, wallet: 0, bank: 0 });
    }

    if (amount > senderData.wallet) {
      return interaction.reply({
        content:
          'You do not have enough money in your wallet to complete this transaction.',
        ephemeral: true,
      });
    }

    senderData.wallet -= amount;
    targetData.wallet += amount;

    await senderData.save();
    await targetData.save();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('💸 Payment Successful')
      .setDescription(
        `You have transferred **${amount} <:disk:1309988409208475730>** to ${target.username}.`,
      )
      .addFields(
        {
          name: 'Your New Wallet Balance',
          value: `${senderData.wallet} <:disk:1309988409208475730>`,
          inline: true,
        },
        {
          name: `${target.username}'s New Wallet Balance`,
          value: `${targetData.wallet} <:disk:1309988409208475730>`,
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
