const {
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} = require('discord.js');
const shop = require('../../services/shop');
const purchases = require('../../services/purchases');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins, truncate } = require('../../utils/format');

const PAGE_SIZE = 5;

function describe(t, product) {
  const tags = [
    product.consumable
      ? `${emojis.consumable} ${t('shop.consumable')}`
      : `${emojis.permanent} ${t('shop.permanent')}`,
    product.role_id && `${emojis.role} ${t('shop.grants', { role: `<@&${product.role_id}>` })}`,
  ].filter(Boolean);
  const lines = [`### ${product.name}`, `${coins(product.price)} · ${tags.join(' · ')}`];
  if (product.description) lines.push(`-# ${truncate(product.description, 200)}`);
  return lines.join('\n');
}

function render(t, page) {
  const products = shop.listProducts();
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);

  const card = new ui.Card('shop').header(
    ui.featureTitle(t, 'shop'),
    t('shop.subtitle', { command: mention('buy') }),
  );

  if (products.length === 0) {
    return card
      .divider()
      .text(`${emojis.star} ${t('shop.empty')}`)
      .footer()
      .toMessage();
  }

  for (const product of products.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)) {
    card
      .divider()
      .section(
        describe(t, product),
        new ButtonBuilder()
          .setCustomId(`shop:buy:${product.id}`)
          .setLabel(t('shop.buy'))
          .setEmoji(emojis.buy)
          .setStyle(ButtonStyle.Primary),
      );
  }

  if (pages > 1) {
    card.divider().actions([
      new ButtonBuilder()
        .setCustomId(`shop:page:${current - 1}`)
        .setEmoji(emojis.previous)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current === 0),
      new ButtonBuilder()
        .setCustomId('shop:noop')
        .setLabel(`${current + 1} / ${pages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`shop:page:${current + 1}`)
        .setEmoji(emojis.next)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current >= pages - 1),
    ]);
  }

  return card.footer(t('shop.items', { count: products.length })).toMessage();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse the items for sale.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    await interaction.reply(render(t, 0));
  },

  components: {
    async page(interaction, [page], { t }) {
      await interaction.update(render(t, Number(page)));
    },

    async buy(interaction, [productId], { t }) {
      const product = shop.getProduct(Number(productId));
      if (!product) return interaction.reply(ui.error(t('shop.gone')));

      const result = await purchases.buy(interaction.member, product, 1, t);
      if (!result.ok) return interaction.reply(ui.error(result.error));

      const { wallet } = economy.findAccount(interaction.user.id);
      const parts = [
        t('shop.boughtQuick', { item: product.name, amount: coins(result.total) }),
        result.role && t('shop.boughtRole', { role: result.role }),
        t('shop.walletNow', { amount: coins(wallet) }),
      ];
      return interaction.reply(ui.success(parts.filter(Boolean).join(' ')));
    },
  },
};
