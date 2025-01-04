const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require('discord.js');
const { Settings } = require('../../models/Settings');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/datawork.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const defaultMessages = data.defaultMessages;
const defaultRange = data.defaultRange;
const defaultCooldown = data.defaultCooldown;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('managework')
    .setDescription('Manage and configure work settings.')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Choose an action to perform.')
        .setRequired(true)
        .addChoices(
          {
            name: 'Reset All Settings',
            value: 'reset_all',
            description:
              'Reset all work settings to default values including messages, range, and cooldown.',
          },
          {
            name: 'Remove Message',
            value: 'remove',
            description:
              'Remove a specific work message by its index or remove all messages.',
          },
          {
            name: 'Add Message',
            value: 'add_message',
            description: 'Add a new work message to the list.',
          },
          {
            name: 'Set Range',
            value: 'set_range',
            description: 'Set the range of coins that can be earned from work.',
          },
          {
            name: 'Set Cooldown',
            value: 'set_cooldown',
            description:
              'Set the cooldown time (in seconds) for work commands.',
          },
          {
            name: 'View Config',
            value: 'config',
            description: 'View the current configuration of work settings.',
          },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('index')
        .setDescription('The index of the message to remove (starting from 0).')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The work message to add.')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('min')
        .setDescription('The minimum number of coins that can be earned.')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('max')
        .setDescription('The maximum number of coins that can be earned.')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('cooldown')
        .setDescription('The cooldown time in seconds.')
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
    const index = interaction.options.getInteger('index');
    const message = interaction.options.getString('message');
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');
    const cooldown = interaction.options.getInteger('cooldown');

    switch (action) {
      case 'reset_all': {
        await Settings.upsert({
          key: 'workMessages',
          value: JSON.stringify(defaultMessages),
        });
        await Settings.upsert({
          key: 'workRange',
          value: JSON.stringify(defaultRange),
        });
        await Settings.upsert({
          key: 'workCooldown',
          value: defaultCooldown.toString(),
        });

        return interaction.reply(
          '🔄 All work settings have been reset to their default values.',
        );
      }

      case 'remove': {
        const workMessages = await Settings.findOne({
          where: { key: 'workMessages' },
        });

        if (workMessages) {
          const messages = JSON.parse(workMessages.value);

          if (index === null) {
            // Remove all messages
            await Settings.update(
              { value: '[]' },
              { where: { key: 'workMessages' } },
            );

            return interaction.reply('🗑️ All work messages have been removed.');
          }

          const removedMessage = messages.splice(index, 1);
          workMessages.value = JSON.stringify(messages);
          await workMessages.save();

          return interaction.reply(
            `🗑️ Work message removed: ${removedMessage}`,
          );
        } else {
          return interaction.reply({
            content: '⚠️ No work messages found.',
            ephemeral: true,
          });
        }
      }

      case 'add_message': {
        if (!message) {
          return interaction.reply({
            content: '⚠️ You must provide a message to add.',
            ephemeral: true,
          });
        }
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
        return interaction.reply(`✅ Work message added: ${message}`);
      }

      case 'set_range': {
        if ((min !== null && max === null) || (min === null && max !== null)) {
          return interaction.reply({
            content: '⚠️ Both minimum and maximum coins must be set together.',
            ephemeral: true,
          });
        }

        if (min >= max) {
          return interaction.reply({
            content: '⚠️ Minimum coins must be less than maximum coins.',
            ephemeral: true,
          });
        }
        await Settings.upsert({
          key: 'workRange',
          value: JSON.stringify({ min, max }),
        });
        return interaction.reply(`✅ Work range set: ${min} - ${max} coins.`);
      }

      case 'set_cooldown': {
        if (cooldown === null) {
          return interaction.reply({
            content: '⚠️ You must provide a cooldown time in seconds.',
            ephemeral: true,
          });
        }
        await Settings.upsert({
          key: 'workCooldown',
          value: cooldown.toString(),
        });
        return interaction.reply(`✅ Cooldown set to: ${cooldown} seconds.`);
      }

      case 'config': {
        const workMessages = await Settings.findOne({
          where: { key: 'workMessages' },
        });
        const workRange = await Settings.findOne({
          where: { key: 'workRange' },
        });
        const workCooldown = await Settings.findOne({
          where: { key: 'workCooldown' },
        });

        const messages = workMessages
          ? JSON.parse(workMessages.value)
          : defaultMessages;
        const range = workRange ? JSON.parse(workRange.value) : defaultRange;
        const cooldownTime = workCooldown
          ? workCooldown.value
          : defaultCooldown;

        const configEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('⚙️ **Work Configuration**')
          .addFields(
            {
              name: 'Messages',
              value:
                messages.length > 0 ? messages.join('\n') : 'No messages found',
              inline: false,
            },
            {
              name: 'Range',
              value: `Min: ${range.min}, Max: ${range.max}`,
              inline: false,
            },
            {
              name: 'Cooldown',
              value: `${cooldownTime} seconds`,
              inline: false,
            },
          )
          .setTimestamp();

        return interaction.reply({ embeds: [configEmbed] });
      }

      default: {
        return interaction.reply({
          content: '⚠️ Invalid action specified. Please choose a valid action.',
          ephemeral: true,
        });
      }
    }
  },
};
