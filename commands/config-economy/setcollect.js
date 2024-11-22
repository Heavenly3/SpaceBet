const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { RoleCollect } = require('../../models/RoleCollect');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcollect')
    .setDescription('Set the collect amount for a role (admin only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to set the collect amount for')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The collect amount')
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

    await RoleCollect.upsert({ roleId: role.id, amount });

    await interaction.reply(
      `The collect amount for role **${role.name}** has been set to **${amount} <:money:1305557747017973791>**.`,
    );
  },
};
