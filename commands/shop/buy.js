const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { Product } = require('../../models/Product');
const { Inventory } = require('../../models/Inventory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop.')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('The name of the item you want to buy.')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('quantity')
        .setDescription('The quantity of the item you want to buy.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to buy items.',
        ephemeral: true,
      });
    }

    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity');
    const product = await Product.findOne({ where: { name: itemName } });

    if (!product) {
      return interaction.reply({
        content: 'The item does not exist in the shop.',
        ephemeral: true,
      });
    }

    const totalCost = product.price * quantity;
    if (user.wallet < totalCost) {
      return interaction.reply({
        content: `You do not have enough money to buy ${quantity} ${product.name}(s).`,
        ephemeral: true,
      });
    }

    user.wallet -= totalCost;
    await user.save();

    let inventory = await Inventory.findOne({
      where: { userId: user.userId, productId: product.id },
    });
    if (!inventory) {
      inventory = await Inventory.create({
        userId: user.userId,
        productId: product.id,
        quantity: quantity,
      });
    } else {
      inventory.quantity += quantity;
      await inventory.save();
    }

    await interaction.reply(
      `You bought ${quantity} ${product.name}(s) for ${totalCost} coins.`,
    );
  },
};
