const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const response = {
        content: 'There was an error executing this command!',
        ephemeral: true,
      };

      interaction.replied || interaction.deferred
        ? await interaction.followUp(response)
        : await interaction.reply(response);
    }
  },
};
