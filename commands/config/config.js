const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View and manage configuration settings.'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('configCategory')
        .setPlaceholder('Select a configuration category')
        .addOptions([
          {
            label: 'Work Settings',
            description: 'View and manage work settings',
            value: 'workSettings',
          },
        ]),
    );

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Configuration Menu')
      .setDescription('Select a category to view its settings.');

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
