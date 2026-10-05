const { sql, transaction } = require('../database');

const ACCOUNTS = new Set(['wallet', 'bank']);

function assertAccount(account) {
  if (!ACCOUNTS.has(account)) throw new Error(`Invalid account "${account}"`);
}

function assertAmount(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error(`Invalid amount "${amount}"`);
  }
}

/** Fetches the account of a Discord user, creating it on first use. */
function getAccount(user) {
  sql(
    `INSERT INTO users (user_id, username) VALUES (?, ?)
     ON CONFLICT (user_id) DO UPDATE SET username = excluded.username
     WHERE users.username IS NOT excluded.username`,
  ).run(user.id, user.username);
  return sql('SELECT * FROM users WHERE user_id = ?').get(user.id);
}

/** Stores the Discord language of a user, used for DMs and announcements. */
function rememberLocale(user, locale) {
  if (!locale) return;
  sql(
    `INSERT INTO users (user_id, username, locale) VALUES (?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET locale = excluded.locale, username = excluded.username
     WHERE users.locale IS NOT excluded.locale OR users.username IS NOT excluded.username`,
  ).run(user.id, user.username, locale);
}

function findAccount(userId) {
  return sql('SELECT * FROM users WHERE user_id = ?').get(userId) ?? null;
}

function credit(userId, amount, account = 'wallet') {
  assertAccount(account);
  assertAmount(amount);
  sql(`UPDATE users SET ${account} = ${account} + ?, updated_at = ? WHERE user_id = ?`).run(
    amount,
    Date.now(),
    userId,
  );
}

/** Removes `amount` only if the account can cover it. Returns success. */
function debit(userId, amount, account = 'wallet') {
  assertAccount(account);
  assertAmount(amount);
  const { changes } = sql(
    `UPDATE users SET ${account} = ${account} - ?, updated_at = ?
     WHERE user_id = ? AND ${account} >= ?`,
  ).run(amount, Date.now(), userId, amount);
  return changes === 1;
}

/** Removes up to `amount` and returns how much was actually taken. */
function debitUpTo(userId, amount, account = 'wallet') {
  return transaction(() => {
    const balance = findAccount(userId)?.[account] ?? 0;
    const taken = Math.max(0, Math.min(balance, amount));
    if (taken > 0) debit(userId, taken, account);
    return taken;
  });
}

/** Moves money between the wallet and bank of the same user. */
function move(userId, from, to, amount) {
  assertAccount(from);
  assertAccount(to);
  return transaction(() => {
    if (!debit(userId, amount, from)) return false;
    credit(userId, amount, to);
    return true;
  });
}

/** Wallet-to-wallet transfer between two users. */
function transfer(fromId, toId, amount) {
  return transaction(() => {
    if (!debit(fromId, amount)) return false;
    credit(toId, amount);
    return true;
  });
}

function setBalance(userId, account, amount) {
  assertAccount(account);
  sql(`UPDATE users SET ${account} = ?, updated_at = ? WHERE user_id = ?`).run(
    amount,
    Date.now(),
    userId,
  );
}

/** Subtracts without a floor (used when collecting overdue debt). */
function forceDebit(userId, amount, account = 'wallet') {
  assertAccount(account);
  sql(`UPDATE users SET ${account} = ${account} - ?, updated_at = ? WHERE user_id = ?`).run(
    amount,
    Date.now(),
    userId,
  );
}

function leaderboard(limit, offset = 0) {
  return sql(
    `SELECT user_id, username, wallet, bank, wallet + bank AS net_worth
     FROM users WHERE wallet + bank > 0
     ORDER BY net_worth DESC, user_id LIMIT ? OFFSET ?`,
  ).all(limit, offset);
}

/** Totals of the whole economy, for the admin panel. */
function stats() {
  const row = sql(
    `SELECT COUNT(*) AS accounts, COALESCE(SUM(wallet), 0) AS wallets, COALESCE(SUM(bank), 0) AS banks
     FROM users WHERE wallet <> 0 OR bank <> 0`,
  ).get();
  return { accounts: row.accounts, wallets: row.wallets, banks: row.banks };
}

function leaderboardSize() {
  return sql('SELECT COUNT(*) AS total FROM users WHERE wallet + bank > 0').get().total;
}

function rankOf(userId) {
  const row = sql(
    `SELECT COUNT(*) + 1 AS rank FROM users
     WHERE wallet + bank > (SELECT wallet + bank FROM users WHERE user_id = ?)`,
  ).get(userId);
  return row?.rank ?? null;
}

module.exports = {
  getAccount,
  rememberLocale,
  findAccount,
  credit,
  debit,
  debitUpTo,
  forceDebit,
  move,
  transfer,
  setBalance,
  leaderboard,
  stats,
  leaderboardSize,
  rankOf,
};
