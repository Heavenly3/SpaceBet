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
        content: 'You need to have an account to collect rewards.',
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
        rewardsList += `<@&${role.id}> - **${roleCollect.amount} <:money:1305557747017973791>**\n`;
      }
    }

    if (totalReward === 0) {
      return interaction.reply({
        content:
          'You do not have any collectable rewards with your current roles.',
        ephemeral: true,
      });
    }

    user.wallet += totalReward;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎉 Daily Collect!')
      .setDescription(
        `You collected a total of **${totalReward} <:money:1305557747017973791>** from your roles!\n\n**Roles and Rewards:**\n${rewardsList}`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
