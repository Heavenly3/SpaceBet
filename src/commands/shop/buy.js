const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const shop = require('../../services/shop');
const purchases = require('../../services/purchases');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins, formatNumber } = require('../../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('The item to buy')
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
    await interaction.respond(
      shop.searchProducts(interaction.options.getFocused()).map((product) => ({
        name: `${product.name} — ${formatNumber(product.price)}`.slice(0, 100),
        value: String(product.id),
      })),
    );
  },

  async execute(interaction, { t }) {
    const product = shop.resolveProduct(interaction.options.getString('item'));
    if (!product) {
      return interaction.reply(ui.error(t('shop.notFound', { command: mention('shop') })));
    }

    const quantity = interaction.options.getInteger('quantity') ?? 1;
    const result = await purchases.buy(interaction.member, product, quantity, t);
    if (!result.ok) return interaction.reply(ui.error(result.error));

    const card = new ui.Card('shop')
      .header(
        `${emojis.buy} ${t('shop.purchaseTitle')}`,
        t('shop.purchaseBody', { quantity, item: product.name, amount: coins(result.total) }),
      )
      .divider()
      .stats([
        result.role && {
          name: `${emojis.role} ${t('shop.roleReceived')}`,
          value: `${result.role}`,
        },
        product.consumable && {
          name: `${emojis.inventory} ${t('shop.owned')}`,
          value: formatNumber(shop.getQuantity(interaction.user.id, product.id)),
        },
        {
          name: `${emojis.wallet} ${t('common.wallet')}`,
          value: coins(economy.findAccount(interaction.user.id).wallet),
        },
      ])
      .footer(product.consumable ? t('shop.useHint') : t('features.shop'));

    await interaction.reply(card.toMessage());
  },
};
