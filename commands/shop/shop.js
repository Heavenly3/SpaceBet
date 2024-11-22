const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Product } = require('../../models/Product');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the items available in the shop.'),
  async execute(interaction) {
    const products = await Product.findAll();
    if (products.length === 0) {
      return interaction.reply('The shop is currently empty.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Shop')
      .setDescription('Here are the items available for purchase:');

    products.forEach((product) => {
      embed.addFields({
        name: product.name,
        value: `Price: ${product.price} coins\n${product.description || ''}`,
        inline: true,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
