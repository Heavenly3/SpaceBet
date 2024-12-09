const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { RoleCollect } = require('../../models/RoleCollect');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modifycollect')
    .setDescription('Modify the collect amount for a role (admin only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to modify the collect amount for')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The new collect amount')
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
    const amount = interaction.options.getInteger('amount');

    const roleCollect = await RoleCollect.findOne({
      where: { roleId: role.id },
    });
    if (!roleCollect) {
      return interaction.reply(
        `The role **${role.name}** does not have a collect amount set.`,
      );
    }

    roleCollect.amount = amount;
    await roleCollect.save();

    await interaction.reply(
      `The collect amount for role **${role.name}** has been modified to **${amount} <:disk:1309988409208475730>**.`,
    );
  },
};
