const { LabelBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js');
const economy = require('../../../services/economy');
const emojis = require('../../../config/emojis');
const { coins, formatNumber } = require('../../../utils/format');
const { button, modal, textField, ButtonStyle } = require('../shared');

const ACTIONS = ['add', 'remove', 'set', 'reset'];
const MEDALS = [emojis.first, emojis.second, emojis.third];

function adjustModal(t) {
  const select = (id, options, required = true) =>
    new StringSelectMenuBuilder().setCustomId(id).setRequired(required).addOptions(options);

  return modal('members', 'save', t('panel.members.modalTitle')).addLabelComponents(
    new LabelBuilder()
      .setLabel(t('panel.members.member'))
      .setUserSelectMenuComponent(
        new UserSelectMenuBuilder().setCustomId('user').setRequired(true),
      ),
    new LabelBuilder().setLabel(t('panel.members.action')).setStringSelectMenuComponent(
      select(
        'action',
        ACTIONS.map((value) => ({
          label: t(`panel.members.actions.${value}`),
          value,
          default: value === 'add',
        })),
      ),
    ),
    new LabelBuilder().setLabel(t('panel.members.account')).setStringSelectMenuComponent(
      select(
        'account',
        ['wallet', 'bank'].map((value) => ({
          label: t(`common.${value}`),
          emoji: emojis[value],
          value,
          default: value === 'wallet',
        })),
        false,
      ),
    ),
    textField('amount', t('panel.members.amount'), {
      description: t('panel.members.amountHint'),
      required: false,
      max: 15,
    }),
  );
}

module.exports = {
  icon: 'netWorth',
  color: 'economy',

  render(t) {
    const stats = economy.stats();
    const top = economy
      .leaderboard(3)
      .map((row, i) => `${MEDALS[i]} <@${row.user_id}> · ${coins(row.net_worth)}`);
    return {
      blocks: [
        [
          `**${t('panel.members.accounts')}** · ${formatNumber(stats.accounts)}`,
          `**${emojis.wallet} ${t('panel.members.inWallets')}** · ${coins(stats.wallets)}`,
          `**${emojis.bank} ${t('panel.members.inBanks')}** · ${coins(stats.banks)}`,
        ].join('\n'),
        top.length ? `### ${emojis.rank} ${t('features.leaderboard')}\n${top.join('\n')}` : null,
        `-# ${t('panel.members.hint')}`,
      ],
      rows: [
        [button('members', 'adjust', t('panel.members.adjust'), emojis.money, ButtonStyle.Primary)],
      ],
    };
  },

  actions: {
    adjust(interaction, _args, t) {
      return { modal: adjustModal(t) };
    },

    save(interaction, _args, t) {
      const { fields } = interaction;
      const user = fields.getSelectedUsers('user', true).first();
      const action = fields.getStringSelectValues('action')[0] ?? 'add';
      const account = fields.getStringSelectValues('account')[0] ?? 'wallet';
      const raw = fields.getTextInputValue('amount').replace(/[,._\s]/g, '');
      const amount = /^\d+$/.test(raw) ? Number(raw) : null;

      if (user.bot) return { error: t('common.botsNoAccount') };
      if (action !== 'reset' && (amount === null || (action !== 'set' && amount === 0))) {
        return { error: t('panel.members.amountRequired') };
      }

      const before = economy.getAccount(user);
      const vars = { user, account: t(`managemoney.accounts.${account}`) };
      let summary;
      if (action === 'add') {
        economy.credit(user.id, amount, account);
        summary = t('managemoney.add', { ...vars, amount: coins(amount) });
      } else if (action === 'remove') {
        const taken = economy.debitUpTo(user.id, amount, account);
        summary = t('managemoney.remove', { ...vars, amount: coins(taken) });
      } else if (action === 'set') {
        economy.setBalance(user.id, account, amount);
        summary = t('managemoney.set', { ...vars, amount: coins(amount) });
      } else {
        economy.setBalance(user.id, 'wallet', 0);
        economy.setBalance(user.id, 'bank', 0);
        summary = t('managemoney.reset', vars);
      }

      const after = economy.findAccount(user.id);
      return {
        banner: [
          `${emojis.success} ${summary}`,
          `-# ${emojis.wallet} ${coins(before.wallet)} → ${coins(after.wallet)} · ${emojis.bank} ${coins(before.bank)} → ${coins(after.bank)}`,
        ].join('\n'),
      };
    },
  },
};
