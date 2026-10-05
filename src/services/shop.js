const { sql, transaction } = require('../database');
const economy = require('./economy');

function mapProduct(row) {
  return row ? { ...row, consumable: Boolean(row.consumable) } : null;
}

function listProducts() {
  return sql('SELECT * FROM products ORDER BY price, name').all().map(mapProduct);
}

function getProduct(id) {
  return mapProduct(sql('SELECT * FROM products WHERE id = ?').get(id));
}

function findProductByName(name) {
  return mapProduct(sql('SELECT * FROM products WHERE name = ?').get(name));
}

/** Resolves autocomplete values (product id) as well as typed names. */
function resolveProduct(input) {
  return /^\d+$/.test(input)
    ? (getProduct(Number(input)) ?? findProductByName(input))
    : findProductByName(input);
}

function searchProducts(query, limit = 25) {
  return sql(
    `SELECT * FROM products WHERE name LIKE ? ESCAPE '\\'
     ORDER BY name LIMIT ?`,
  )
    .all(`%${query.replace(/[%_\\]/g, '\\$&')}%`, limit)
    .map(mapProduct);
}

function addProduct({ name, price, description, roleId, consumable }) {
  const { lastInsertRowid } = sql(
    `INSERT INTO products (name, price, description, role_id, consumable)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(name, price, description ?? null, roleId ?? null, consumable ? 1 : 0);
  return getProduct(Number(lastInsertRowid));
}

function removeProduct(id) {
  return sql('DELETE FROM products WHERE id = ?').run(id).changes > 0;
}

function getQuantity(userId, productId) {
  return (
    sql('SELECT quantity FROM inventory WHERE user_id = ? AND product_id = ?').get(
      userId,
      productId,
    )?.quantity ?? 0
  );
}

function getInventory(userId) {
  return sql(
    `SELECT p.*, i.quantity FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE i.user_id = ? ORDER BY p.name`,
  )
    .all(userId)
    .map(mapProduct);
}

function addItem(userId, productId, quantity) {
  sql(
    `INSERT INTO inventory (user_id, product_id, quantity) VALUES (?, ?, ?)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = quantity + excluded.quantity`,
  ).run(userId, productId, quantity);
}

/** Removes items from an inventory. Returns false if there are not enough. */
function removeItem(userId, productId, quantity) {
  return transaction(() => {
    const owned = getQuantity(userId, productId);
    if (owned < quantity) return false;
    if (owned === quantity) {
      sql('DELETE FROM inventory WHERE user_id = ? AND product_id = ?').run(userId, productId);
    } else {
      sql(
        `UPDATE inventory SET quantity = quantity - ?
         WHERE user_id = ? AND product_id = ?`,
      ).run(quantity, userId, productId);
    }
    return true;
  });
}

/** Charges the wallet and adds the items. Returns false if funds are short. */
function purchase(userId, product, quantity) {
  return transaction(() => {
    if (!economy.debit(userId, product.price * quantity)) return false;
    addItem(userId, product.id, quantity);
    return true;
  });
}

/** Undoes a purchase (used when a role cannot be granted). */
function refund(userId, product, quantity) {
  transaction(() => {
    removeItem(userId, product.id, quantity);
    economy.credit(userId, product.price * quantity);
  });
}

module.exports = {
  listProducts,
  getProduct,
  findProductByName,
  resolveProduct,
  searchProducts,
  addProduct,
  removeProduct,
  getQuantity,
  getInventory,
  addItem,
  removeItem,
  purchase,
  refund,
};
