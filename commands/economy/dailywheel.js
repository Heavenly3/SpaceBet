const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { Settings } = require('../../models/Settings');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/datawheel.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const defaultRewards = JSON.stringify(data.defaultRewards);
const defaultInterval = data.defaultInterval;

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailywheel')
    .setDescription('Spin the daily wheel for rewards!'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: '🚀 **You need an account to spin the Daily Wheel.**',
        ephemeral: true,
      });
    }

    const intervalSetting = await Settings.findOne({
      where: { key: 'dailywheel_interval' },
    });
    const interval = intervalSetting
      ? parseInt(intervalSetting.value, 10)
      : defaultInterval;

    const now = Date.now();
    const lastSpin = cooldowns.get(interaction.user.id) || 0;

    if (now - lastSpin < interval * 1000) {
      const timeLeft = (lastSpin + interval * 1000 - now) / 1000;
      return interaction.reply({
        content: `⏲️ **Please wait ${Math.ceil(timeLeft)} seconds before spinning the wheel again.**`,
        ephemeral: true,
      });
    }

    const settings = await Settings.findOne({
      where: { key: 'dailywheel_rewards' },
    });
    const rewards = settings
      ? JSON.parse(settings.value)
      : JSON.parse(defaultRewards);

    if (rewards.length === 0) {
      return interaction.reply({
        content:
          '⚠️ **No rewards available to spin. Please contact the administrator.**',
        ephemeral: true,
      });
    }

    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    if (reward.amount > 0) {
      user.wallet += reward.amount;
    }
    await user.save();
    cooldowns.set(interaction.user.id, now);

    const embed = new EmbedBuilder()
      .setColor(reward.amount > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🛸 **Daily Cosmic Wheel Spin!**')
      .setDescription(
        reward.amount > 0
          ? `🌌 **Congratulations!** You won **${reward.name}**! Your wallet has been updated. 🚀💰`
          : `💫 **Better luck next time!** You won **${reward.name}**. Try again tomorrow! 🌠✨`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
