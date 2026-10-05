const { sql, transaction } = require('../database');
const economy = require('./economy');
const settings = require('./settings');
const { randomBetween } = require('../utils/random');
const { raffle: config } = require('../config/games');

function getState() {
  let state = sql('SELECT * FROM raffle_state WHERE id = 1').get();
  if (!state) {
    sql('INSERT INTO raffle_state (id, pot) VALUES (1, ?)').run(settings.get('raffle.basePot'));
    state = sql('SELECT * FROM raffle_state WHERE id = 1').get();
  }
  return state;
}

function ticketCount() {
  return sql('SELECT COUNT(*) AS total FROM raffle_tickets').get().total;
}

function ticketsOf(userId) {
  return sql('SELECT number FROM raffle_tickets WHERE user_id = ? ORDER BY number')
    .all(userId)
    .map((row) => row.number);
}

/**
 * Buys a ticket. The first ticket of a round schedules the draw.
 * Returns { ok, reason?, state }.
 */
function buyTicket(userId, number, channelId) {
  const price = settings.get('raffle.ticketPrice');

  return transaction(() => {
    const owned = sql('SELECT 1 FROM raffle_tickets WHERE user_id = ? AND number = ?').get(
      userId,
      number,
    );
    if (owned) return { ok: false, reason: 'duplicate' };
    if (!economy.debit(userId, price)) return { ok: false, reason: 'funds' };

    const state = getState();
    sql('INSERT INTO raffle_tickets (user_id, number) VALUES (?, ?)').run(userId, number);

    const drawAt = state.draw_at ?? Date.now() + settings.get('raffle.drawDelay') * 1000;
    sql(
      `UPDATE raffle_state SET pot = pot + ?, draw_at = ?,
       channel_id = COALESCE(channel_id, ?) WHERE id = 1`,
    ).run(price, drawAt, channelId);

    return { ok: true, price, state: getState() };
  });
}

function isDue() {
  const state = getState();
  return state.draw_at !== null && state.draw_at <= Date.now();
}

/**
 * Draws the winning number. Holders of that number split the pot; if
 * nobody holds it the pot rolls over to the next round.
 */
function draw() {
  return transaction(() => {
    const state = getState();
    const winningNumber = randomBetween(0, config.maxNumber);
    const winners = sql('SELECT user_id FROM raffle_tickets WHERE number = ?')
      .all(winningNumber)
      .map((row) => row.user_id);
    const tickets = ticketCount();

    const share = winners.length ? Math.floor(state.pot / winners.length) : 0;
    for (const userId of winners) economy.credit(userId, share);

    const nextPot = winners.length ? settings.get('raffle.basePot') : state.pot;
    sql('DELETE FROM raffle_tickets').run();
    sql('UPDATE raffle_state SET pot = ?, draw_at = NULL, channel_id = NULL WHERE id = 1').run(
      nextPot,
    );

    return {
      winningNumber,
      winners,
      share,
      pot: state.pot,
      nextPot,
      tickets,
      channelId: state.channel_id,
    };
  });
}

module.exports = { getState, ticketCount, ticketsOf, buyTicket, isDue, draw };
