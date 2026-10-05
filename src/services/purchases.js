const shop = require('./shop');
const economy = require('./economy');
const { coins } = require('../utils/format');

/** Gives a role to a member, checking the bot is allowed to. */
async function grantRole(member, roleId, t) {
  const role = member.guild.roles.cache.get(roleId);
  if (!role) return { ok: false, reason: t('shop.roleMissing') };
  if (!role.editable) return { ok: false, reason: t('shop.roleNotEditable', { role }) };
  if (member.roles.cache.has(role.id)) return { ok: true, role, alreadyHad: true };
  await member.roles.add(role, 'SpaceBet shop item');
  return { ok: true, role };
}

/**
 * Full purchase flow shared by /buy and the shop buttons.
 * Non-consumable items with a role grant it immediately and can only be
 * owned once; consumables go to the inventory to be used later.
 *
 * @returns {Promise<{ ok: boolean, error?: string, total?: number, role?: object }>}
 */
async function buy(member, product, quantity, t) {
  const userId = member.id;
  economy.getAccount(member.user);
  const grantsNow = product.role_id && !product.consumable;

  if (grantsNow && (quantity > 1 || shop.getQuantity(userId, product.id) > 0)) {
    return { ok: false, error: t('shop.alreadyOwned', { item: product.name }) };
  }

  const total = product.price * quantity;
  if (!shop.purchase(userId, product, quantity)) {
    const { wallet } = economy.findAccount(userId);
    return {
      ok: false,
      error: t('shop.cantAfford', { total: coins(total), wallet: coins(wallet) }),
    };
  }

  if (grantsNow) {
    try {
      const granted = await grantRole(member, product.role_id, t);
      if (!granted.ok) {
        shop.refund(userId, product, quantity);
        return { ok: false, error: t('shop.refunded', { reason: granted.reason }) };
      }
      return { ok: true, total, role: granted.role };
    } catch {
      shop.refund(userId, product, quantity);
      return { ok: false, error: t('shop.roleRejected') };
    }
  }

  return { ok: true, total };
}

module.exports = { buy, grantRole };
