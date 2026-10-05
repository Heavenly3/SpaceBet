const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const cooldowns = require('../../services/cooldowns');
const roleRewards = require('../../services/roleRewards');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { coins, relativeTime } = require('../../utils/format');

module.exports = {
  cooldown: 'collect.cooldown',

  data: new SlashCommandBuilder()
    .setName('collect')
    .setDescription('Collect the income granted by your roles.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    const { user, member } = interaction;
    const remaining = cooldowns.remaining(user.id, 'collect');
    if (remaining) return interaction.reply(ui.cooldown(t, remaining, t('collect.action')));

    const rewards = roleRewards.forRoles(member.roles.cache.keys());
    if (rewards.length === 0) {
      return interaction.reply(ui.info(`${emojis.comet} ${t('collect.noRewards')}`));
    }

    const total = rewards.reduce((sum, reward) => sum + reward.amount, 0);
    economy.getAccount(user);
    economy.credit(user.id, total);
    const readyAt = cooldowns.startConfigured(user.id, 'collect');

    const card = new ui.Card('collect')
      .header(
        `${emojis.collect} ${t('collect.title')}`,
        t('collect.body', { amount: coins(total) }),
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .text(rewards.map((reward) => `<@&${reward.role_id}> · ${coins(reward.amount)}`).join('\n'))
      .divider()
      .stats([
        {
          name: `${emojis.wallet} ${t('common.wallet')}`,
          value: coins(economy.findAccount(user.id).wallet),
        },
        { name: `${emojis.cooldown} ${t('collect.next')}`, value: relativeTime(readyAt) },
      ])
      .footer(t('features.collect'));

    await interaction.reply(card.toMessage());
  },
};
