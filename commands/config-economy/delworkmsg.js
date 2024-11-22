const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Settings } = require('../../models/Settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delworkmsg')
    .setDescription('Manage work messages.')
    .addIntegerOption((option) =>
      option
        .setName('index')
        .setDescription('The index of the message to remove (starting from 0)')
        .setRequired(false),
    ),
  async execute(interaction) {
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

    const index = interaction.options.getInteger('index');

    if (index === null) {
      await Settings.upsert({
        key: 'workMessages',
        value: JSON.stringify(['You worked hard and earned some coins!']),
      });
      await interaction.reply(
        'All work messages have been reset to the default message.',
      );
    } else {
      const workMessages = await Settings.findOne({
        where: { key: 'workMessages' },
      });

      if (workMessages) {
        const messages = JSON.parse(workMessages.value);

        if (index < 0 || index >= messages.length) {
          return interaction.reply({
            content:
              'Invalid index. Please provide a valid message index to remove.',
            ephemeral: true,
          });
        }

        const removedMessage = messages.splice(index, 1);
        workMessages.value = JSON.stringify(messages);
        await workMessages.save();

        await interaction.reply(`Work message removed: ${removedMessage}`);
      } else {
        await interaction.reply({
          content: 'No work messages found.',
          ephemeral: true,
        });
      }
    }
  },
};
