const {
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} = require('discord.js');
const economy = require('../../services/economy');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins } = require('../../utils/format');

const PAGE_SIZE = 10;
const MEDALS = [emojis.first, emojis.second, emojis.third];

function render(t, userId, page) {
  const total = economy.leaderboardSize();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  const rows = economy.leaderboard(PAGE_SIZE, current * PAGE_SIZE);

  const lines = rows.map((row, index) => {
    const position = current * PAGE_SIZE + index + 1;
    const badge = MEDALS[position - 1] ?? `\`#${position}\``;
    const you = row.user_id === userId ? ` ◂ **${t('leaderboard.you')}**` : '';
    return `${badge} <@${row.user_id}> · ${coins(row.net_worth)}${you}`;
  });

  const card = new ui.Card('leaderboard')
    .header(ui.featureTitle(t, 'leaderboard'), t('leaderboard.subtitle'))
    .divider()
    .text(lines.length ? lines.join('\n') : `${emojis.brand} ${t('leaderboard.empty')}`);

  if (pages > 1) {
    card.actions([
      new ButtonBuilder()
        .setCustomId(`leaderboard:page:${userId}:${current - 1}`)
        .setEmoji(emojis.previous)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current === 0),
      new ButtonBuilder()
        .setCustomId('leaderboard:noop')
        .setLabel(`${current + 1} / ${pages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`leaderboard:page:${userId}:${current + 1}`)
        .setEmoji(emojis.next)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current >= pages - 1),
    ]);
  }

  const account = economy.findAccount(userId);
  const ranked = account && account.wallet + account.bank > 0;
  return card
    .footer(ranked ? t('leaderboard.yourRank', { rank: economy.rankOf(userId) }) : null)
    .toMessage();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the richest commanders in the galaxy.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    await interaction.reply(render(t, interaction.user.id, 0));
  },

  components: {
    async page(interaction, [ownerId, page], { t }) {
      if (interaction.user.id !== ownerId) {
        return interaction.reply(
          ui.info(t('common.notYours', { command: mention('leaderboard') })),
        );
      }
      await interaction.update(render(t, ownerId, Number(page)));
    },
  },
};
