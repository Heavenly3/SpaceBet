const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Settings } = require('../../models/Settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwork')
    .setDescription('Configure work settings.')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The work message to add (optional)')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('min')
        .setDescription('Minimum coins (optional)')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('max')
        .setDescription('Maximum coins (optional)')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('cooldown')
        .setDescription('Cooldown time in seconds (optional)')
        .setRequired(false),
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

    const message = interaction.options.getString('message');
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');
    const cooldown = interaction.options.getInteger('cooldown');

    let replyMessage = 'Settings updated:';

    if ((min !== null && max === null) || (min === null && max !== null)) {
      return interaction.reply({
        content: 'Both minimum and maximum coins must be set together.',
        ephemeral: true,
      });
    }

    if (message) {
      const workMessages = await Settings.findOne({
        where: { key: 'workMessages' },
      });
      if (workMessages) {
        const messages = JSON.parse(workMessages.value);
        messages.push(message);
        workMessages.value = JSON.stringify(messages);
        await workMessages.save();
      } else {
        await Settings.create({
          key: 'workMessages',
          value: JSON.stringify([message]),
        });
      }
      replyMessage += `\n- Work message added: ${message}`;
    }

    if (min !== null && max !== null) {
      if (min >= max) {
        return interaction.reply({
          content: 'Minimum coins must be less than maximum coins.',
          ephemeral: true,
        });
      }
      await Settings.upsert({
        key: 'workRange',
        value: JSON.stringify({ min, max }),
      });
      replyMessage += `\n- Work range set: ${min} - ${max} coins.`;
    }

    if (cooldown !== null) {
      await Settings.upsert({
        key: 'workCooldown',
        value: cooldown.toString(),
      });
      replyMessage += `\n- Cooldown set to: ${cooldown} seconds.`;
    }

    await interaction.reply(replyMessage);
  },
};
