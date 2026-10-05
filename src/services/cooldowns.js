const { sql } = require('../database');
const settings = require('./settings');

/**
 * Milliseconds left before `userId` can use `name` again (0 when ready).
 * Cooldowns live in the database, so they survive restarts.
 */
function remaining(userId, name) {
  const row = sql('SELECT expires_at FROM cooldowns WHERE user_id = ? AND name = ?').get(
    userId,
    name,
  );
  return row ? Math.max(0, row.expires_at - Date.now()) : 0;
}

function start(userId, name, seconds) {
  const expiresAt = Date.now() + seconds * 1000;
  sql(
    `INSERT INTO cooldowns (user_id, name, expires_at) VALUES (?, ?, ?)
     ON CONFLICT (user_id, name) DO UPDATE SET expires_at = excluded.expires_at`,
  ).run(userId, name, expiresAt);
  return expiresAt;
}

/** Starts the cooldown configured in the `<name>.cooldown` setting. */
function startConfigured(userId, name) {
  return start(userId, name, settings.get(`${name}.cooldown`));
}

function clear(userId, name) {
  sql('DELETE FROM cooldowns WHERE user_id = ? AND name = ?').run(userId, name);
}

function purgeExpired() {
  return sql('DELETE FROM cooldowns WHERE expires_at <= ?').run(Date.now()).changes;
}

module.exports = { remaining, start, startConfigured, clear, purgeExpired };
