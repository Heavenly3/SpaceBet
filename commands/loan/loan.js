const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

// Establece el interés y la fecha de vencimiento predeterminados
const DEFAULT_INTEREST = 5; // Interés predeterminado del 5%
const DEFAULT_DUE_SECONDS = 30; // El préstamo vence en 30 segundos a partir de la fecha de la solicitud

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loan')
    .setDescription('Request a loan')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to borrow')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: '⚠️ You need to have an account to request a loan.',
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({
        content: '⚠️ Please enter a valid loan amount.',
        ephemeral: true,
      });
    }

    if (user.wallet < 0 || user.bank < 0) {
      return interaction.reply({
        content:
          '⚠️ You cannot request a loan with a negative balance. Please clear your balance first.',
        ephemeral: true,
      });
    }

    if (user.loanActive) {
      return interaction.reply({
        content: '⚠️ You already have an active loan. Please repay it first.',
        ephemeral: true,
      });
    }

    const loanDueDate = new Date();
    loanDueDate.setSeconds(loanDueDate.getSeconds() + DEFAULT_DUE_SECONDS); // Establece la fecha de vencimiento a 30 segundos

    user.loanActive = true;
    user.loanAmount = amount;
    user.loanInterest = DEFAULT_INTEREST;
    user.loanDueDate = loanDueDate;
    user.wallet += amount; // Agrega el monto del préstamo a la wallet del usuario

    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Loan Approved!')
      .setDescription(
        `🎉 You have successfully requested a loan of **${amount}** with an interest rate of **${DEFAULT_INTEREST}%**.\nYour loan is due on **${loanDueDate.toLocaleString()}**. The loan amount has been added to your wallet.`,
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
