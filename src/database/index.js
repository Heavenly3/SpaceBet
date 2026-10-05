const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { databasePath } = require('../config/env');
const migrations = require('./migrations');
const log = require('../core/logger').child('db');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

// node:sqlite is synchronous: statements never interleave, so every balance
// update is atomic without extra locking.
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
`);

const statementCache = new Map();

/** Returns a cached prepared statement. */
function sql(query) {
  let statement = statementCache.get(query);
  if (!statement) {
    statement = db.prepare(query);
    statementCache.set(query, statement);
  }
  return statement;
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
function transaction(fn) {
  if (db.isTransaction) return fn();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function migrate() {
  const { user_version: current } = db.prepare('PRAGMA user_version').get();
  if (current >= migrations.length) return;

  for (let version = current; version < migrations.length; version++) {
    transaction(() => {
      db.exec(migrations[version]);
      db.exec(`PRAGMA user_version = ${version + 1}`);
    });
    log.info(`Applied migration ${version + 1}/${migrations.length}`);
  }
}

function close() {
  if (db.isOpen) db.close();
}

module.exports = { db, sql, transaction, migrate, close };
