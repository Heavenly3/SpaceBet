const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { RoleCollect } = require('../../models/RoleCollect');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewcollect')
    .setDescription('View roles with collect rewards (admin only)'),
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

    const rolesWithRewards = await RoleCollect.findAll();

    if (rolesWithRewards.length === 0) {
      return interaction.reply({
        content: 'There are no roles with collect rewards set.',
        ephemeral: true,
      });
    }

    let rewardsList = '';

    for (let roleReward of rolesWithRewards) {
      const role = interaction.guild.roles.cache.get(roleReward.roleId);
      if (role) {
        rewardsList += `<@&${role.id}> - **${roleReward.amount} <:disk:1309988409208475730>**\n`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Roles with Collect Rewards')
      .setDescription(rewardsList)
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
