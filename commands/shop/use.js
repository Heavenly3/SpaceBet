const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const { Product } = require('../../models/Product');
const { Inventory } = require('../../models/Inventory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use a consumable item from your inventory.')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('The name of the item to use.')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('quantity')
        .setDescription('The quantity of the item to use.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to use items.',
        ephemeral: true,
      });
    }

    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity');
    const product = await Product.findOne({ where: { name: itemName } });

    if (!product || !product.consumable) {
      return interaction.reply({
        content: 'The item does not exist or is not consumable.',
        ephemeral: true,
      });
    }

    const inventory = await Inventory.findOne({
      where: { userId: user.userId, productId: product.id },
    });
    if (!inventory || inventory.quantity < quantity) {
      return interaction.reply({
        content: 'You do not have enough of this item in your inventory.',
        ephemeral: true,
      });
    }

    inventory.quantity -= quantity;
    await inventory.save();

    if (inventory.quantity <= 0) {
      await inventory.destroy();
    }

    if (product.role) {
      const roleId = product.role.match(/\d+/)[0];
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        try {
          await interaction.member.roles.add(role);
        } catch (error) {
          console.error('Error adding role:', error);
          return interaction.reply({
            content: `There was an error adding the role ${product.role}.`,
            ephemeral: true,
          });
        }
      } else {
        return interaction.reply({
          content: `Role ${product.role} not found in the server.`,
          ephemeral: true,
        });
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Item Used')
      .setDescription(
        `You have used ${quantity} ${product.name}(s).\n${product.description || ''}`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
