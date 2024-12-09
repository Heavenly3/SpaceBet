const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { RoleCollect } = require('../../models/RoleCollect');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collect')
    .setDescription('Collect your daily reward based on your role'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content:
          '🚀 You need to have an account to collect rewards from the galaxy.',
        ephemeral: true,
      });
    }

    const memberRoles = interaction.member.roles.cache;
    let totalReward = 0;
    let rewardsList = '';

    for (let role of memberRoles.values()) {
      const roleCollect = await RoleCollect.findOne({
        where: { roleId: role.id },
      });
      if (roleCollect) {
        totalReward += roleCollect.amount;
        rewardsList += `<@&${role.id}> - **${roleCollect.amount} <:disk:1309988409208475730>** (Stellar Bonus)\n`;
      }
    }

    if (totalReward === 0) {
      return interaction.reply({
        content:
          '💫 You do not have any collectable rewards with your current roles in the cosmos.',
        ephemeral: true,
      });
    }

    user.wallet += totalReward;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🚀 Stellar Daily Collection!')
      .setDescription(
        `🌌 You have successfully collected **${totalReward} <:disk:1309988409208475730>** from your galactic roles!\n\n**Your Stellar Roles & Rewards:**\n${rewardsList}\nPrepare for more space adventures!`,
      )
      .setThumbnail('https://example.com/space-icon.png') // Un icono galáctico o algo relacionado con el espacio.
      .setTimestamp()
      .setFooter({
        text: `Space Commander: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
