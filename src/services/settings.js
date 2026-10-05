const { sql } = require('../database');
const DEFAULTS = require('../config/defaults');

const cache = new Map();

function assertKnown(key) {
  if (!(key in DEFAULTS)) throw new Error(`Unknown setting "${key}"`);
}

/** Current value of a setting, falling back to its default. */
function get(key) {
  assertKnown(key);
  if (!cache.has(key)) {
    const row = sql('SELECT value FROM settings WHERE key = ?').get(key);
    cache.set(key, row ? JSON.parse(row.value) : DEFAULTS[key]);
  }
  return structuredClone(cache.get(key));
}

function set(key, value) {
  assertKnown(key);
  sql(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
  ).run(key, JSON.stringify(value));
  cache.set(key, structuredClone(value));
}

function reset(...keys) {
  for (const key of keys) {
    assertKnown(key);
    sql('DELETE FROM settings WHERE key = ?').run(key);
    cache.delete(key);
  }
}

/** True when an admin changed the setting (it is stored in the database). */
function isCustom(key) {
  assertKnown(key);
  return Boolean(sql('SELECT 1 FROM settings WHERE key = ?').get(key));
}

function getDefault(key) {
  assertKnown(key);
  return structuredClone(DEFAULTS[key]);
}

module.exports = { get, set, reset, isCustom, getDefault };
