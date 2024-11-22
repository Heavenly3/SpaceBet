const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { RoleCollect } = require('../../models/RoleCollect');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removecollect')
    .setDescription('Remove the collect amount for a role (admin only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to remove the collect amount from')
        .setRequired(true),
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

    const role = interaction.options.getRole('role');

    const roleCollect = await RoleCollect.findOne({
      where: { roleId: role.id },
    });
    if (!roleCollect) {
      return interaction.reply(
        `The role **${role.name}** does not have a collect amount set.`,
      );
    }

    await RoleCollect.destroy({ where: { roleId: role.id } });

    await interaction.reply(
      `The collect amount for role **${role.name}** has been removed.`,
    );
  },
};
