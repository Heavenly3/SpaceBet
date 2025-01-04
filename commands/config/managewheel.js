const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require('discord.js');
const { Settings } = require('../../models/Settings');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../../data/datawheel.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const defaultRewards = JSON.stringify(data.defaultRewards);
const defaultInterval = data.defaultInterval;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('managewheel')
    .setDescription('Manage the rewards for the Daily Wheel.')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription(
          'Choose an action: add, remove, list, reset, setinterval.',
        )
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
          { name: 'List', value: 'list' },
          { name: 'Reset', value: 'reset' },
          { name: 'Set Interval', value: 'setinterval' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The reward name (required for add and remove).')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The reward amount (required for add).')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('interval')
        .setDescription(
          'Set the spin interval in seconds (required for setinterval).',
        )
        .setRequired(false),
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator,
      )
    ) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const action = interaction.options.getString('action');
    const rewardsKey = 'dailywheel_rewards';
    const intervalKey = 'dailywheel_interval';

    let rewardsData = await Settings.findOne({ where: { key: rewardsKey } });
    if (!rewardsData) {
      rewardsData = await Settings.create({
        key: rewardsKey,
        value: defaultRewards,
      });
    }

    let intervalData = await Settings.findOne({ where: { key: intervalKey } });
    if (!intervalData) {
      intervalData = await Settings.create({
        key: intervalKey,
        value: defaultInterval.toString(),
      });
    }

    let rewards = JSON.parse(rewardsData.value);
    let interval = parseInt(intervalData.value, 10);

    switch (action) {
      case 'add': {
        const name = interaction.options.getString('name');
        const amount = interaction.options.getInteger('amount');

        if (!name || amount === null) {
          return interaction.reply(
            '⚠️ You must provide both a name and an amount for the reward.',
          );
        }

        rewards.push({ name, amount });
        await Settings.update(
          { value: JSON.stringify(rewards) },
          { where: { key: rewardsKey } },
        );

        return interaction.reply(
          `✅ Added reward **${name}** with amount **${amount}**.`,
        );
      }

      case 'remove': {
        const name = interaction.options.getString('name');

        if (name === null) {
          // Remove all rewards
          rewards = [];
        } else {
          const filteredRewards = rewards.filter(
            (reward) => reward.name !== name,
          );

          if (filteredRewards.length === rewards.length) {
            return interaction.reply(`⚠️ Reward **${name}** not found.`);
          }

          rewards = filteredRewards;
        }

        await Settings.update(
          { value: JSON.stringify(rewards) },
          { where: { key: rewardsKey } },
        );

        return interaction.reply(
          name === null
            ? `✅ All rewards have been removed.`
            : `✅ Removed reward **${name}**.`,
        );
      }

      case 'list': {
        const rewardsList = rewards
          .map((reward, i) => `${i + 1}. ${reward.name} - ${reward.amount}`)
          .join('\n');
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('🎉 **Daily Wheel Rewards**')
          .setDescription(rewardsList || '⚠️ No rewards available.')
          .addFields({
            name: 'Spin Interval',
            value: `${interval} seconds`,
            inline: true,
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      case 'reset': {
        await Settings.update(
          { value: defaultRewards },
          { where: { key: rewardsKey } },
        );

        return interaction.reply('🔄 Rewards have been reset to default.');
      }

      case 'setinterval': {
        const newInterval = interaction.options.getInteger('interval');

        if (newInterval === null || newInterval <= 0) {
          return interaction.reply(
            '⚠️ You must provide a valid interval in seconds.',
          );
        }

        interval = newInterval;
        await Settings.update(
          { value: interval.toString() },
          { where: { key: intervalKey } },
        );

        return interaction.reply(
          `⏲️ Spin interval has been set to **${interval}** seconds.`,
        );
      }

      default:
        return interaction.reply('❌ Invalid action.');
    }
  },
};
