// Imports data from the old Sequelize database (database.sqlite) into the
// new schema. Safe to run more than once: existing rows are updated.
//
//   npm run migrate:legacy                 # reads ./database.sqlite
//   npm run migrate:legacy -- path/to.db   # custom location
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { ROOT_DIR } = require('../src/config/env');
const { db, migrate, transaction, close } = require('../src/database');
const settings = require('../src/services/settings');
const log = require('../src/core/logger').child('legacy');

const legacyPath = path.resolve(ROOT_DIR, process.argv[2] ?? 'database.sqlite');
if (!fs.existsSync(legacyPath)) {
  log.error(`No legacy database found at ${legacyPath}`);
  process.exit(1);
}

const legacy = new DatabaseSync(legacyPath, { readOnly: true });
const tables = new Set(
  legacy
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => row.name),
);
const rows = (table) => (tables.has(table) ? legacy.prepare(`SELECT * FROM "${table}"`).all() : []);
const toInt = (value) => Math.trunc(Number(value) || 0);

const SETTING_KEYS = {
  workMessages: 'work.messages',
  workRange: 'work.range',
  workCooldown: 'work.cooldown',
  collectCooldown: 'collect.cooldown',
  dailywheel_rewards: 'wheel.rewards',
  dailywheel_interval: 'wheel.cooldown',
};

migrate();
const counts = {};

transaction(() => {
  const upsertUser = db.prepare(
    `INSERT INTO users (user_id, username, wallet, bank) VALUES (?, ?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET username = excluded.username,
       wallet = excluded.wallet, bank = excluded.bank`,
  );
  const upsertLoan = db.prepare(
    `INSERT OR REPLACE INTO loans (user_id, principal, interest_rate, amount_due, due_at)
     VALUES (?, ?, ?, ?, ?)`,
  );
  counts.users = 0;
  counts.loans = 0;
  for (const user of rows('Users')) {
    upsertUser.run(
      String(user.userId),
      user.username ?? null,
      toInt(user.wallet),
      toInt(user.bank),
    );
    counts.users++;
    if (user.loanActive) {
      const principal = toInt(user.loanAmount);
      const rate = toInt(user.loanInterest);
      const dueAt = user.loanDueDate ? new Date(user.loanDueDate).getTime() : Date.now();
      upsertLoan.run(
        String(user.userId),
        principal,
        rate,
        principal + Math.ceil((principal * rate) / 100),
        dueAt,
      );
      counts.loans++;
    }
  }

  const upsertReward = db.prepare(
    `INSERT INTO role_rewards (role_id, amount) VALUES (?, ?)
     ON CONFLICT (role_id) DO UPDATE SET amount = excluded.amount`,
  );
  counts.roleRewards = 0;
  for (const reward of rows('RoleCollects')) {
    if (toInt(reward.amount) <= 0) continue;
    upsertReward.run(String(reward.roleId), toInt(reward.amount));
    counts.roleRewards++;
  }

  const productIds = new Map();
  const findProduct = db.prepare('SELECT id FROM products WHERE name = ?');
  const insertProduct = db.prepare(
    `INSERT INTO products (name, price, description, role_id, consumable) VALUES (?, ?, ?, ?, ?)`,
  );
  counts.products = 0;
  for (const product of rows('Products')) {
    const existing = findProduct.get(product.name);
    const roleId = String(product.role ?? '').match(/\d{15,}/)?.[0] ?? null;
    const id = existing
      ? existing.id
      : Number(
          insertProduct.run(
            product.name,
            Math.max(0, toInt(product.price)),
            product.description ?? null,
            roleId,
            product.consumable ? 1 : 0,
          ).lastInsertRowid,
        );
    productIds.set(product.id, id);
    counts.products++;
  }

  const upsertItem = db.prepare(
    `INSERT INTO inventory (user_id, product_id, quantity) VALUES (?, ?, ?)
     ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = excluded.quantity`,
  );
  counts.inventory = 0;
  for (const item of rows('Inventories')) {
    const productId = productIds.get(item.productId);
    if (!productId || toInt(item.quantity) <= 0) continue;
    upsertItem.run(String(item.userId), productId, toInt(item.quantity));
    counts.inventory++;
  }
});

counts.settings = 0;
for (const row of rows('Settings')) {
  const key = SETTING_KEYS[row.key];
  if (!key) continue;
  try {
    let value = JSON.parse(row.value);
    if (key === 'wheel.rewards') {
      value = value.map((reward) => ({
        name: null,
        amount: Math.max(0, toInt(reward.amount)),
      }));
    }
    settings.set(key, value);
    counts.settings++;
  } catch {
    log.warn(`Skipped unreadable setting "${row.key}"`);
  }
}

legacy.close();
close();
log.info('Legacy data imported:', counts);
