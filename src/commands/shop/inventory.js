const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const shop = require('../../services/shop');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins } = require('../../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('See the items you (or another member) own.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) => option.setName('user').setDescription('Member to inspect')),

  async execute(interaction, { t }) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const items = shop.getInventory(target.id);
    const worth = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const lines = items.map((item) => {
      const tags = [
        item.consumable && emojis.consumable,
        item.role_id && `<@&${item.role_id}>`,
      ].filter(Boolean);
      return `**${item.quantity}×** ${item.name}${tags.length ? ` · ${tags.join(' · ')}` : ''}`;
    });

    const card = new ui.Card('inventory')
      .header(
        ui.featureTitle(t, 'inventory'),
        t('inventory.subtitle', { user: target }),
        target.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .text(
        lines.length
          ? lines.join('\n')
          : `${emojis.shop} ${t('inventory.empty', { command: mention('shop') })}`,
      )
      .footer(items.length ? t('inventory.value', { amount: coins(worth) }) : null);

    await interaction.reply(card.toMessage());
  },
};
