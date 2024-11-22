const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Product } = require('../../models/Product');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeitem')
    .setDescription('Remove an item from the shop (admin only).')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the item to remove.')
        .setRequired(true),
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

    const item = await Product.findOne({ where: { name } });
    if (!item) {
      return interaction.reply(`Item ${name} does not exist.`);
    }

    await Product.destroy({ where: { name } });
    await interaction.reply(`Item ${name} has been removed from the shop.`);
  },
};
