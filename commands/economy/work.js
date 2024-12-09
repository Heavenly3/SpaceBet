const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { User } = require('../../models/User');
const { Settings } = require('../../models/Settings');
const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn coins.'),
  async execute(interaction) {
    let user = await User.findOne({ where: { userId: interaction.user.id } });

    if (!user) {
      user = await User.create({
        userId: interaction.user.id,
        wallet: 0,
        bank: 0,
      });
    }

    const isAdmin = interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator,
    );

    const cooldownSetting = await Settings.findOne({
      where: { key: 'workCooldown' },
    });
    const cooldownAmount = cooldownSetting
      ? parseInt(cooldownSetting.value) * 1000
      : 30 * 1000;

    if (!isAdmin) {
      const now = Date.now();
      if (cooldowns.has(user.userId)) {
        const expirationTime = cooldowns.get(user.userId) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `Please wait ${timeLeft.toFixed(1)} more seconds before working again.`,
            ephemeral: true,
          });
        }
      }

      cooldowns.set(user.userId, now);
    }

    const workMessagesSetting = await Settings.findOne({
      where: { key: 'workMessages' },
    });
    const workMessages = workMessagesSetting
      ? JSON.parse(workMessagesSetting.value)
      : ['You worked hard and earned some coins!'];

    const workRangeSetting = await Settings.findOne({
      where: { key: 'workRange' },
    });
    const workRange = workRangeSetting
      ? JSON.parse(workRangeSetting.value)
      : { min: 10, max: 100 };

    const earnings =
      Math.floor(Math.random() * (workRange.max - workRange.min + 1)) +
      workRange.min;
    const message =
      workMessages[Math.floor(Math.random() * workMessages.length)];

    user.wallet += earnings;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0xffff00)
      .setTitle('🔨 Work Completed')
      .setDescription(
        `${message} You earned **${earnings} <:disk:1309988409208475730>**.`,
      )
      .addFields({
        name: 'New Wallet Balance',
        value: `${user.wallet} <:disk:1309988409208475730>`,
        inline: true,
      })
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
