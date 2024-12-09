const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loanstatus')
    .setDescription('Check your loan status'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to check your loan status.',
        ephemeral: true,
      });
    }

    if (!user.loanActive) {
      return interaction.reply({
        content: 'You do not have any active loan.',
        ephemeral: true,
      });
    }

    const loanAmount = user.loanAmount;
    const loanInterest = user.loanInterest;
    const loanDueDate = new Date(user.loanDueDate);
    const currentDate = new Date();
    const remainingDays = Math.ceil(
      (loanDueDate - currentDate) / (1000 * 3600 * 24),
    );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📊 Loan Status')
      .setDescription('Here is the detailed status of your active loan:')
      .addFields(
        {
          name: '💰 Loan Amount',
          value: `**${loanAmount}** <:disk:1309988409208475730>`,
          inline: true,
        },
        {
          name: '📈 Interest Rate',
          value: `**${loanInterest}%**`,
          inline: true,
        },
        {
          name: '📅 Due Date',
          value: `**${loanDueDate.toLocaleDateString()}**`,
          inline: true,
        },
        {
          name: '🕰️ Remaining Days',
          value: `**${remainingDays}**`,
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
