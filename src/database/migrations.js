// Each entry upgrades the schema by one version. Never edit a migration that
// has shipped — append a new one instead. The current version is stored in
// SQLite's `PRAGMA user_version`.
module.exports = [
  `
  CREATE TABLE users (
    user_id    TEXT PRIMARY KEY,
    username   TEXT,
    wallet     INTEGER NOT NULL DEFAULT 0,
    bank       INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE cooldowns (
    user_id    TEXT NOT NULL,
    name       TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, name)
  );

  CREATE TABLE role_rewards (
    role_id TEXT PRIMARY KEY,
    amount  INTEGER NOT NULL CHECK (amount > 0)
  );

  CREATE TABLE products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    price       INTEGER NOT NULL CHECK (price >= 0),
    description TEXT,
    role_id     TEXT,
    consumable  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE inventory (
    user_id    TEXT NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (user_id, product_id)
  );

  CREATE TABLE loans (
    user_id       TEXT PRIMARY KEY,
    principal     INTEGER NOT NULL,
    interest_rate INTEGER NOT NULL,
    amount_due    INTEGER NOT NULL,
    due_at        INTEGER NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE raffle_tickets (
    user_id    TEXT NOT NULL,
    number     INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    PRIMARY KEY (user_id, number)
  );

  CREATE TABLE raffle_state (
    id         INTEGER PRIMARY KEY CHECK (id = 1),
    pot        INTEGER NOT NULL,
    draw_at    INTEGER,
    channel_id TEXT
  );

  CREATE INDEX idx_users_networth ON users ((wallet + bank) DESC);
  CREATE INDEX idx_loans_due ON loans (due_at);
  CREATE INDEX idx_raffle_number ON raffle_tickets (number);
  `,
  `
  ALTER TABLE users ADD COLUMN locale TEXT;
  `,
];
