const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const shop = require('../../services/shop');
const purchases = require('../../services/purchases');
const ui = require('../../ui');
const emojis = require('../../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use a consumable item from your inventory.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('The item to use')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('quantity')
        .setDescription('How many (default 1)')
        .setMinValue(1)
        .setMaxValue(1000),
    ),

  async autocomplete(interaction) {
    const query = interaction.options.getFocused().toLowerCase();
    await interaction.respond(
      shop
        .getInventory(interaction.user.id)
        .filter((item) => item.consumable && item.name.toLowerCase().includes(query))
        .slice(0, 25)
        .map((item) => ({
          name: `${item.name} (×${item.quantity})`.slice(0, 100),
          value: String(item.id),
        })),
    );
  },

  async execute(interaction, { t }) {
    const { user, member } = interaction;
    const product = shop.resolveProduct(interaction.options.getString('item'));
    const quantity = interaction.options.getInteger('quantity') ?? 1;

    if (!product) return interaction.reply(ui.error(t('use.notFound')));
    if (!product.consumable) {
      return interaction.reply(ui.error(t('use.permanent', { item: product.name })));
    }
    if (product.role_id && quantity > 1) return interaction.reply(ui.error(t('use.roleOne')));

    const owned = shop.getQuantity(user.id, product.id);
    if (owned < quantity) {
      return interaction.reply(
        ui.error(t('use.notEnough', { quantity: owned, item: product.name })),
      );
    }

    let role = null;
    if (product.role_id) {
      try {
        const granted = await purchases.grantRole(member, product.role_id, t);
        if (!granted.ok) return interaction.reply(ui.error(granted.reason));
        if (granted.alreadyHad) {
          return interaction.reply(ui.info(t('use.alreadyHad', { role: granted.role })));
        }
        role = granted.role;
      } catch {
        return interaction.reply(ui.error(t('use.roleRejected')));
      }
    }

    shop.removeItem(user.id, product.id, quantity);

    const card = new ui.Card('inventory')
      .header(
        `${emojis.sparkle} ${t('use.title')}`,
        t('use.body', { quantity, item: product.name }),
      )
      .divider()
      .stats([
        product.description && { name: emojis.description, value: product.description },
        role && { name: `${emojis.role} ${t('shop.roleReceived')}`, value: `${role}` },
        { name: `${emojis.inventory} ${t('use.remaining')}`, value: String(owned - quantity) },
      ])
      .footer(t('features.inventory'));

    await interaction.reply(card.toMessage());
  },
};
