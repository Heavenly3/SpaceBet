const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to steal money from another user.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to steal from')
        .setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const thief = interaction.user;

    if (target.id === thief.id) {
      return interaction.reply({
        content: 'You cannot steal from yourself.',
        ephemeral: true,
      });
    }

    let thiefData = await User.findOne({ where: { userId: thief.id } });
    let targetData = await User.findOne({ where: { userId: target.id } });

    if (!thiefData) {
      thiefData = await User.create({ userId: thief.id, wallet: 0, bank: 0 });
    }

    if (!targetData) {
      targetData = await User.create({ userId: target.id, wallet: 0, bank: 0 });
    }

    if (targetData.wallet <= 0) {
      return interaction.reply({
        content: `${target.username} has no money in their wallet to steal.`,
        ephemeral: true,
      });
    }

    const successChance = Math.random();
    let stolenAmount = 0;
    let fineAmount = 0;
    let message = '';

    if (successChance < 0.5) {
      const stealPercentage = Math.random();
      stolenAmount = Math.floor(targetData.wallet * stealPercentage);
      if (stolenAmount > 0) {
        targetData.wallet -= stolenAmount;
        thiefData.wallet += stolenAmount;
        await targetData.save();
        await thiefData.save();
        message = `You successfully stole **${stolenAmount} <:disk:1309988409208475730>** from ${target.username}.`;
      } else {
        message = `You tried to steal from ${target.username} but failed to get anything valuable.`;
      }
    } else {
      const stealPercentage = Math.random();
      stolenAmount = Math.floor(targetData.wallet * stealPercentage);
      fineAmount = Math.floor(stolenAmount * (Math.random() * (1 - 0.1) + 0.1));
      thiefData.wallet -= fineAmount;
      await thiefData.save();
      message = `You failed to steal any money from ${target.username} and were fined **${fineAmount} <:disk:1309988409208475730>**.`;
    }

    const embed = new EmbedBuilder()
      .setColor(stolenAmount > 0 ? 0x00ff00 : 0xff0000)
      .setTitle(stolenAmount > 0 ? '💰 Theft Successful' : '🚫 Theft Failed')
      .setDescription(message)
      .addFields(
        {
          name: 'Your New Wallet Balance',
          value: `${thiefData.wallet} <:disk:1309988409208475730>`,
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
