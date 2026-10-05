const { LabelBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const shop = require('../../../services/shop');
const emojis = require('../../../config/emojis');
const { coins, formatNumber } = require('../../../utils/format');
const { button, list, modal, picker, textField, ButtonStyle } = require('../shared');

const confirmed = (args) => args.at(-1) === 'yes';

function itemLine(t, item) {
  const type = item.consumable
    ? `${emojis.consumable} ${t('shop.consumable')}`
    : `${emojis.permanent} ${t('shop.permanent')}`;
  const role = item.role_id ? ` · <@&${item.role_id}>` : '';
  return `**${item.name}** · ${coins(item.price)} · ${type}${role}`;
}

function itemModal(t) {
  return modal('shop', 'saveItem', t('panel.shop.modalTitle')).addLabelComponents(
    textField('name', t('panel.shop.name'), { max: 50 }),
    textField('price', t('manageshop.price'), { description: t('config.hints.coins'), max: 12 }),
    textField('description', t('manageshop.description'), {
      required: false,
      paragraph: true,
      max: 200,
    }),
    new LabelBuilder()
      .setLabel(t('manageshop.type'))
      .setDescription(t('panel.shop.typeHint'))
      .setStringSelectMenuComponent(
        new StringSelectMenuBuilder()
          .setCustomId('type')
          .setRequired(true)
          .addOptions(
            {
              label: t('shop.permanent'),
              emoji: emojis.permanent,
              value: 'permanent',
              default: true,
            },
            { label: t('shop.consumable'), emoji: emojis.consumable, value: 'consumable' },
          ),
      ),
    new LabelBuilder()
      .setLabel(t('panel.shop.role'))
      .setDescription(t('panel.shop.roleHint'))
      .setRoleSelectMenuComponent(
        new RoleSelectMenuBuilder().setCustomId('role').setRequired(false),
      ),
  );
}

module.exports = {
  icon: 'shop',
  color: 'shop',

  render(t) {
    const products = shop.listProducts();
    return {
      blocks: [
        `### ${emojis.shop} ${t('panel.shop.items')} (${products.length})\n${
          products.length
            ? list(
                products.map((item) => itemLine(t, item)),
                t,
                10,
              )
            : t('shop.empty')
        }`,
        `-# ${t('panel.shop.hint')}`,
      ],
      rows: [
        [button('shop', 'add', t('panel.shop.add'), emojis.buy, ButtonStyle.Success)],
        [
          picker(
            'shop',
            'remove',
            t('panel.shop.removePlaceholder'),
            products.map((item) => ({
              label: item.name,
              description: formatNumber(item.price),
              emoji: item.consumable ? emojis.consumable : emojis.permanent,
              value: String(item.id),
            })),
          ),
        ],
      ],
    };
  },

  actions: {
    add(interaction, _args, t) {
      return { modal: itemModal(t) };
    },

    saveItem(interaction, _args, t) {
      const { fields } = interaction;
      const name = fields.getTextInputValue('name').trim();
      const rawPrice = fields.getTextInputValue('price').replace(/[,._\s]/g, '');
      const role = fields.getSelectedRoles('role')?.first() ?? null;

      if (!name) return { error: t('panel.shop.nameRequired') };
      if (!/^\d+$/.test(rawPrice)) {
        return {
          error: t('config.invalid', {
            field: t('manageshop.price'),
            hint: t('config.hints.coins'),
          }),
        };
      }
      if (shop.findProductByName(name)) return { error: t('manageshop.exists', { item: name }) };
      if (role && (role.managed || role.id === interaction.guild.id)) {
        return { error: t('manageshop.badRole') };
      }

      const product = shop.addProduct({
        name,
        price: Number(rawPrice),
        description: fields.getTextInputValue('description').trim() || null,
        roleId: role?.id,
        consumable: fields.getStringSelectValues('type')[0] === 'consumable',
      });
      const warning =
        role && !role.editable
          ? `\n-# ${emojis.warning} ${role} ${t('manageshop.cantAssign')}`
          : '';
      return {
        banner: `${emojis.success} ${t('manageshop.addedBody', { item: product.name })}${warning}`,
      };
    },

    remove(interaction, args, t) {
      const id = Number(args[0] ?? interaction.values[0]);
      const product = shop.getProduct(id);
      if (!product) return { error: t('manageshop.notFound') };
      if (!confirmed(args)) {
        return {
          confirm: { action: 'remove', args: [String(id)] },
          banner: `${emojis.warning} ${t('panel.shop.confirmRemove', { item: product.name })}`,
        };
      }
      shop.removeProduct(id);
      return { banner: `${emojis.success} ${t('manageshop.removed', { item: product.name })}` };
    },
  },
};
