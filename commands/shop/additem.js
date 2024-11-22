const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Product } = require('../../models/Product');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('additem')
    .setDescription('Add an item to the shop (admin only).')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the item.')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('price')
        .setDescription('The price of the item.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('The description of the item.')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName('consumable')
        .setDescription('Is the item consumable?')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('role')
        .setDescription('The role granted by the item (optional).')
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

    const name = interaction.options.getString('name');
    const price = interaction.options.getInteger('price');
    const description = interaction.options.getString('description');
    const role = interaction.options.getString('role');
    const consumable = interaction.options.getBoolean('consumable');

    await Product.create({ name, price, description, role, consumable });

    await interaction.reply(`Item ${name} has been added to the shop.`);
  },
};
