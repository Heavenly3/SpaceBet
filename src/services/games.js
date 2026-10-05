const economy = require('./economy');
const cooldowns = require('./cooldowns');
const ui = require('../ui');
const emojis = require('../config/emojis');
const { minBet } = require('../config/games');
const { coins } = require('../utils/format');
const { parseAmount } = require('../utils/parse');

/**
 * Validates and charges a bet in one go. On success the stake is already
 * taken from the wallet and the game cooldown has started.
 *
 * @returns {{ ok: true, amount: number } | { ok: false, reply: object }}
 */
function placeBet(user, input, game, t) {
  const fail = (reply) => ({ ok: false, reply });

  const remaining = cooldowns.remaining(user.id, game);
  if (remaining) {
    return fail(
      ui.cooldown(t, remaining, t('games.action', { game: `**${t(`features.${game}`)}**` })),
    );
  }

  const account = economy.getAccount(user);
  if (account.wallet < minBet) {
    return fail(
      ui.error(t('games.minWallet', { min: coins(minBet), wallet: coins(account.wallet) })),
    );
  }

  const amount = parseAmount(input, account.wallet);
  if (amount === null) return fail(ui.error(t('games.invalidBet')));
  if (amount < minBet) return fail(ui.error(t('games.minBet', { min: coins(minBet) })));
  if (!economy.debit(user.id, amount)) {
    return fail(ui.error(t('common.notEnoughWallet', { amount: coins(account.wallet) })));
  }

  cooldowns.startConfigured(user.id, game);
  return { ok: true, amount };
}

/** Pays out `stake × multiplier` and returns the payout and net result. */
function settle(userId, stake, multiplier) {
  const payout = Math.floor(stake * multiplier);
  if (payout > 0) economy.credit(userId, payout);
  return {
    payout,
    net: payout - stake,
    wallet: economy.findAccount(userId).wallet,
  };
}

/** Accent colour of a finished game. */
function outcomeColor(net) {
  if (net > 0) return 'success';
  return net === 0 ? 'warning' : 'danger';
}

/** Standard result block shared by every game. */
function resultText(t, { stake, payout, net, wallet }) {
  const outcome =
    net > 0
      ? `${emojis.up} **${t('games.won', { amount: coins(net) })}**`
      : net === 0
        ? `${emojis.refund} **${t('games.refund')}**`
        : `${emojis.down} **${t('games.lost', { amount: coins(-net) })}**`;
  return [
    outcome,
    `${emojis.bet} ${t('games.bet')} · ${coins(stake)}`,
    `${emojis.money} ${t('games.payout')} · ${coins(payout)}`,
    `${emojis.wallet} ${t('common.wallet')} · ${coins(wallet)}`,
  ].join('\n');
}

module.exports = { placeBet, settle, outcomeColor, resultText };
