const { User } = require('../../models/User');
const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-loan')
    .setDescription('Deletes active user loans')
    .addStringOption((option) =>
      option
        .setName('user')
        .setDescription('Mention or user ID. Use "all" to delete all loans.')
        .setRequired(true),
    ),

  async execute(interaction) {
    // Verificar si el usuario tiene permisos de administrador
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator,
      )
    ) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const userInput = interaction.options.getString('user');

    if (userInput === 'all') {
      try {
        const usersWithActiveLoans = await User.findAll({
          where: { loanActive: true },
        });

        for (const user of usersWithActiveLoans) {
          user.loanActive = false;
          user.loanAmount = 0;
          user.loanInterest = 0;
          user.loanDueDate = null;
          await user.save();

          console.log(`Loan deleted for ${user.username}`);
        }

        return interaction.reply('All active loans have been deleted.');
      } catch (error) {
        console.error('Error deleting loans:', error);
        return interaction.reply('There was an error deleting the loans.');
      }
    } else {
      try {
        let user;

        if (userInput.startsWith('<@') && userInput.endsWith('>')) {
          const userId = userInput.slice(2, -1);
          user = await User.findOne({
            where: { id: userId, loanActive: true },
          });
        } else {
          user = await User.findOne({
            where: { id: userInput, loanActive: true },
          });
        }

        if (!user) {
          return interaction.reply('No active loan found for that user.');
        }

        user.loanActive = false;
        user.loanAmount = 0;
        user.loanInterest = 0;
        user.loanDueDate = null;
        await user.save();

        console.log(`Loan deleted for ${user.username}`);
        return interaction.reply(`Loan for ${user.username} deleted.`);
      } catch (error) {
        console.error('Error deleting loan:', error);
        return interaction.reply('There was an error deleting the user loan.');
      }
    }
  },
};
