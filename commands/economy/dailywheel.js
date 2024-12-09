const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

const rewards = [
  { name: '100 <:disk:1309988409208475730>', amount: 100 },
  { name: '200 <:disk:1309988409208475730>', amount: 200 },
  { name: '500 <:disk:1309988409208475730>', amount: 500 },
  { name: '1,000 <:disk:1309988409208475730>', amount: 1000 },
  { name: 'Nothing', amount: 0 },
  { name: '2,000 <:disk:1309988409208475730>', amount: 2000 },
  { name: '5,000 <:disk:1309988409208475730>', amount: 5000 },
  { name: 'Nothing', amount: 0 },
  { name: '10,000 <:disk:1309988409208475730>', amount: 10000 },
  { name: 'Nothing', amount: 0 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailywheel')
    .setDescription('Spin the daily wheel for cosmic rewards!'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: '🚀 **You need to have an account to spin the Cosmic Wheel.**',
        ephemeral: true,
      });
    }

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    if (reward.amount > 0) {
      user.wallet += reward.amount;
      await user.save();
    }

    const embed = new EmbedBuilder()
      .setColor(reward.amount > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🛸 **Daily Cosmic Wheel Spin!**')
      .setDescription(
        reward.amount > 0
          ? `🌌 **Congratulations, Space Explorer!** You won **${reward.name}**! Your cosmic wallet has been **boosted**. 🚀💰`
          : `💫 **Better luck next time, Commander!** You won **${reward.name}**. Don't give up, stellar rewards await! 🌠✨`,
      )
      .setThumbnail('https://example.com/space-wheel-icon.png')
      .setFooter({
        text: `Space Commander: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setImage(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1310020009812037642/Outer_space-cuate.png?ex=6743b2b5&is=67426135&hm=fb43f1a17d11c8fe943b6562e1f500c0f777ae0769f05c502d17b60d0dccdece&',
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
