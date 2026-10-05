const { LabelBuilder, RoleSelectMenuBuilder } = require('discord.js');
const roleRewards = require('../../../services/roleRewards');
const emojis = require('../../../config/emojis');
const { coins } = require('../../../utils/format');
const {
  button,
  editButton,
  list,
  modal,
  picker,
  settingLines,
  textField,
  ButtonStyle,
} = require('../shared');

const confirmed = (args) => args.at(-1) === 'yes';
const roleName = (guild, roleId) => guild?.roles.cache.get(roleId)?.name ?? roleId;

module.exports = {
  icon: 'collect',
  color: 'collect',

  render(t, { guild }) {
    const rewards = roleRewards.list();
    return {
      blocks: [
        settingLines(t, 'collect'),
        `### ${emojis.role} ${t('panel.collect.roles')}\n${
          rewards.length
            ? list(
                rewards.map((reward) => `<@&${reward.role_id}> · ${coins(reward.amount)}`),
                t,
              )
            : t('panel.collect.empty')
        }`,
      ],
      rows: [
        [
          editButton(t, 'collect'),
          button('collect', 'add', t('panel.collect.add'), emojis.role, ButtonStyle.Success),
          button('collect', 'clear', t('panel.clearAll'), emojis.reset, ButtonStyle.Danger),
        ],
        [
          picker(
            'collect',
            'remove',
            t('panel.collect.removePlaceholder'),
            rewards.map((reward) => ({
              label: `@${roleName(guild, reward.role_id)}`,
              description: `${reward.amount.toLocaleString('en-US')}`,
              emoji: emojis.role,
              value: reward.role_id,
            })),
          ),
        ],
      ],
    };
  },

  actions: {
    add(interaction, _args, t) {
      return {
        modal: modal('collect', 'saveRole', t('panel.collect.modalTitle')).addLabelComponents(
          new LabelBuilder()
            .setLabel(t('panel.collect.roleLabel'))
            .setRoleSelectMenuComponent(
              new RoleSelectMenuBuilder().setCustomId('role').setRequired(true),
            ),
          textField('amount', t('panel.collect.amountLabel'), {
            description: t('config.hints.coins'),
            max: 12,
          }),
        ),
      };
    },

    saveRole(interaction, _args, t) {
      const role = interaction.fields.getSelectedRoles('role', true).first();
      const raw = interaction.fields.getTextInputValue('amount').replace(/[,._\s]/g, '');
      if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
        return {
          error: t('config.invalid', {
            field: t('panel.collect.amountLabel'),
            hint: t('config.hints.coins'),
          }),
        };
      }
      roleRewards.set(role.id, Number(raw));
      return {
        banner: `${emojis.success} ${t('managecollect.set', { role: `<@&${role.id}>`, amount: coins(Number(raw)) })}`,
      };
    },

    remove(interaction, _args, t) {
      const roleId = interaction.values[0];
      roleRewards.remove(roleId);
      return {
        banner: `${emojis.success} ${t('managecollect.removed', { role: `<@&${roleId}>` })}`,
      };
    },

    clear(interaction, args, t) {
      if (!confirmed(args)) {
        return {
          confirm: { action: 'clear' },
          banner: `${emojis.warning} ${t('panel.collect.confirmClear')}`,
        };
      }
      return {
        banner: `${emojis.success} ${t('managecollect.cleared', { count: roleRewards.clear() })}`,
      };
    },
  },
};
