const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { Settings } = require('../models/Settings');

async function handleBackToConfig(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('configCategory')
      .setPlaceholder('Select a configuration category')
      .addOptions([
        {
          label: 'Work Settings',
          description: 'View and manage work settings',
          value: 'workSettings',
        },
      ]),
  );

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Configuration Menu')
    .setDescription('Select a category to view its settings.');

  await interaction.update({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

async function handleBackToWorkSettings(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('workSettings')
      .setPlaceholder('Select a work setting option')
      .addOptions([
        {
          label: 'View Registered Work Messages',
          value: 'viewWorkMessages',
        },
        {
          label: 'View Work Range',
          value: 'viewWorkRange',
        },
      ]),
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('backToConfig')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary),
  );

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Work Settings')
    .setDescription('Select an option to view or manage work settings.');

  await interaction.update({
    embeds: [embed],
    components: [row, backRow],
    ephemeral: true,
  });
}

async function handleViewWorkMessages(interaction) {
  const workMessages = await Settings.findOne({
    where: { key: 'workMessages' },
  });

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('backToWorkSettings')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary),
  );

  if (workMessages) {
    const messages = JSON.parse(workMessages.value);
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Registered Work Messages')
      .setDescription(
        messages.map((message, index) => `${index}: ${message}`).join('\n'),
      );

    await interaction.update({ embeds: [embed], components: [backRow] });
  } else {
    await interaction.update({
      content: 'No work messages found.',
      components: [backRow],
      ephemeral: true,
    });
  }
}

async function handleViewWorkRange(interaction) {
  const workRangeSetting = await Settings.findOne({
    where: { key: 'workRange' },
  });

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('backToWorkSettings')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary),
  );

  if (workRangeSetting) {
    const workRange = JSON.parse(workRangeSetting.value);
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Work Range Settings')
      .setDescription(
        `Minimum: ${workRange.min} coins\nMaximum: ${workRange.max} coins`,
      );

    await interaction.update({ embeds: [embed], components: [backRow] });
  } else {
    await interaction.update({
      content: 'No work range settings found.',
      components: [backRow],
      ephemeral: true,
    });
  }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error executing this command!',
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const selectedCategory = interaction.values[0];
      switch (selectedCategory) {
        case 'workSettings':
          await handleBackToWorkSettings(interaction);
          break;
        case 'viewWorkMessages':
          await handleViewWorkMessages(interaction);
          break;
        case 'viewWorkRange':
          await handleViewWorkRange(interaction);
          break;
        default:
          await interaction.reply({
            content: 'Invalid selection.',
            ephemeral: true,
          });
      }
    } else if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'backToConfig':
          await handleBackToConfig(interaction);
          break;
        case 'backToWorkSettings':
          await handleBackToWorkSettings(interaction);
          break;
        default:
          await interaction.reply({
            content: 'Invalid action.',
            ephemeral: true,
          });
      }
    }
  },
};
