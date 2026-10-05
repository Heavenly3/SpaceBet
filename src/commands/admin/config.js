const { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const panel = require('../../panels/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Open the Mission Control panel to manage the whole bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    await interaction.reply(panel.render(t, null, { guild: interaction.guild }));
  },

  // Buttons, menus and forms of the panel. Admin-only: the router checks permissions.
  components: {
    async view(interaction, _args, { t }) {
      await interaction.update(
        panel.render(t, interaction.values[0], { guild: interaction.guild, ephemeral: false }),
      );
    },

    async act(interaction, args, { t }) {
      await panel.handle(interaction, args, t);
    },
  },
};
