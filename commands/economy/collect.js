const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { RoleCollect } = require('../../models/RoleCollect');
const { Settings } = require('../../models/Settings');

const cooldowns = new Map();

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

    const cooldownSetting = await Settings.findOne({
      where: { key: 'collectCooldown' },
    });
    const cooldownTime = cooldownSetting
      ? parseInt(cooldownSetting.value) * 1000
      : 30 * 1000;

    const now = Date.now();
    const userId = interaction.user.id;

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownTime;

      if (now < expirationTime) {
        const timeLeft = expirationTime - now;

        let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        let timeLeftStr = '';
        if (days > 0) timeLeftStr += `${days}d `;
        if (hours > 0) timeLeftStr += `${hours}h `;
        if (minutes > 0) timeLeftStr += `${minutes}m `;
        if (seconds > 0) timeLeftStr += `${seconds}s`;

        return interaction.reply({
          content: `⏳ Please wait ${timeLeftStr.trim()} more before collecting rewards again.`,
          ephemeral: true,
        });
      }
    }

    cooldowns.set(userId, now);

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
      .setTimestamp()
      .setFooter({
        text: `Space Commander: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
