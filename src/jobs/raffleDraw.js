const raffle = require('../services/raffle');
const ui = require('../ui');
const emojis = require('../config/emojis');
const { resolveLanguage, translator } = require('../i18n');
const { coins, formatNumber } = require('../utils/format');
const log = require('../core/logger').child('raffle');

const ticket = (number) => `**\`${String(number).padStart(3, '0')}\`**`;

function buildAnnouncement(t, result) {
  const won = result.winners.length > 0;
  const card = new ui.Card(won ? 'raffle' : 'neutral')
    .header(
      ui.featureTitle(t, 'raffle', t('raffle.resultsTitle')),
      t('raffle.winning', { number: ticket(result.winningNumber) }),
    )
    .divider();

  if (won) {
    const winners = result.winners.map((id) => `<@${id}>`).join(', ');
    card.text(
      `${emojis.win} ${
        result.winners.length > 1
          ? t('raffle.winnerSplit', { winners, pot: coins(result.pot), share: coins(result.share) })
          : t('raffle.winnerSingle', { winners, pot: coins(result.pot) })
      }`,
    );
  } else {
    card.text(
      `${t('raffle.noWinner', { tickets: formatNumber(result.tickets), pot: coins(result.nextPot) })} ${emojis.brand}`,
    );
  }
  return card.footer(t('raffle.footer'));
}

module.exports = async function drawRaffle(client) {
  if (!raffle.isDue()) return;

  const result = raffle.draw();
  log.info(
    `Raffle drawn: ${result.winningNumber} — ${result.winners.length} winner(s), pot ${result.pot}.`,
  );
  if (!result.channelId) return;

  try {
    const channel = await client.channels.fetch(result.channelId);
    // Announcements use the server language (its preferred locale when automatic).
    const t = translator(resolveLanguage(channel.guild?.preferredLocale));
    const message = buildAnnouncement(t, result).toMessage();
    message.allowedMentions = { users: result.winners };
    await channel.send(message);
  } catch (error) {
    log.warn('Could not announce the raffle result:', error.message);
  }
};
