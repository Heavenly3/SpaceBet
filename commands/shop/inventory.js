const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { Product } = require('../../models/Product');
const { Inventory } = require('../../models/Inventory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory.'),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to view your inventory.',
        ephemeral: true,
      });
    }

    const inventoryItems = await Inventory.findAll({
      where: { userId: user.userId },
    });
    if (inventoryItems.length === 0) {
      return interaction.reply('Your inventory is empty.');
    }

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setAuthor({
        name: interaction.member.displayName,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle('Inventory')
      .setDescription('Here are the items in your inventory:');

    let inventoryList = '';

    for (const item of inventoryItems) {
      if (item.quantity <= 0) {
        await item.destroy();
        continue;
      }
      const product = await Product.findOne({ where: { id: item.productId } });
      inventoryList += `\` ${item.productId} \` ** ${product.name} ** (${item.quantity})\n`;
    }

    embed.setDescription(inventoryList);

    await interaction.reply({ embeds: [embed] });
  },
};
