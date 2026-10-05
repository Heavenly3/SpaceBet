const { sql } = require('../database');

function list() {
  return sql('SELECT * FROM role_rewards ORDER BY amount DESC').all();
}

function set(roleId, amount) {
  sql(
    `INSERT INTO role_rewards (role_id, amount) VALUES (?, ?)
     ON CONFLICT (role_id) DO UPDATE SET amount = excluded.amount`,
  ).run(roleId, amount);
}

function remove(roleId) {
  return sql('DELETE FROM role_rewards WHERE role_id = ?').run(roleId).changes > 0;
}

function clear() {
  return sql('DELETE FROM role_rewards').run().changes;
}

/** Rewards that apply to a member, given the IDs of their roles. */
function forRoles(roleIds) {
  const ids = new Set(roleIds);
  return list().filter((reward) => ids.has(reward.role_id));
}

module.exports = { list, set, remove, clear, forRoles };
