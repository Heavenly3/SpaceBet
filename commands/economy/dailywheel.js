const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

const rewards = [
  { name: '100 <:money:1305557747017973791>', amount: 100 },
  { name: '200 <:money:1305557747017973791>', amount: 200 },
  { name: '500 <:money:1305557747017973791>', amount: 500 },
  { name: '1,000 <:money:1305557747017973791>', amount: 1000 },
  { name: 'Nothing', amount: 0 },
  { name: '2,000 <:money:1305557747017973791>', amount: 2000 },
  { name: '5,000 <:money:1305557747017973791>', amount: 5000 },
  { name: 'Nothing', amount: 0 },
  { name: '10,000 <:money:1305557747017973791>', amount: 10000 },
  { name: 'Nothing', amount: 0 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailywheel')
    .setDescription('Spin the daily wheel for rewards!'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to spin the wheel.',
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
      .setTitle('🎉 Daily Wheel Spin!')
      .setDescription(
        reward.amount > 0
          ? `Congratulations! You won **${reward.name}**!`
          : `Better luck next time! You won **${reward.name}**.`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
