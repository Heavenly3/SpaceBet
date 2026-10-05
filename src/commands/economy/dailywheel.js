const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const cooldowns = require('../../services/cooldowns');
const wheel = require('../../services/wheel');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { wait } = require('../../core/respond');
const { coins, relativeTime } = require('../../utils/format');
const { pick } = require('../../utils/random');

module.exports = {
  cooldown: 'wheel.cooldown',

  data: new SlashCommandBuilder()
    .setName('dailywheel')
    .setDescription('Spin the Cosmic Wheel for a free reward.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const remaining = cooldowns.remaining(user.id, 'wheel');
    if (remaining) return interaction.reply(ui.cooldown(t, remaining, t('wheel.action')));

    const rewards = wheel.getRewards();
    if (rewards.length === 0) return interaction.reply(ui.warning(t('wheel.empty')));

    const reward = pick(rewards);
    economy.getAccount(user);
    if (reward.amount > 0) economy.credit(user.id, reward.amount);
    const readyAt = cooldowns.startConfigured(user.id, 'wheel');

    const spinning = () =>
      new ui.Card('wheel')
        .header(
          ui.featureTitle(t, 'wheel'),
          `${emojis.spinning} ${t('wheel.spinning', { label: wheel.rewardLabel(pick(rewards), t) })}`,
        )
        .toMessage();

    await interaction.reply(spinning());
    for (let i = 0; i < 2; i++) {
      await wait(900);
      await interaction.editReply(spinning());
    }
    await wait(900);

    const won = reward.amount > 0;
    const label = wheel.rewardLabel(reward, t);
    const card = new ui.Card(won ? 'wheel' : 'neutral')
      .header(
        ui.featureTitle(t, 'wheel'),
        won
          ? `${emojis.galaxy} ${t('wheel.won', { label })}`
          : `${emojis.comet} ${t('wheel.lost', { label })}`,
        user.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .stats([
        {
          name: `${emojis.wallet} ${t('common.wallet')}`,
          value: coins(economy.findAccount(user.id).wallet),
        },
        { name: `${emojis.cooldown} ${t('wheel.next')}`, value: relativeTime(readyAt) },
      ])
      .footer();

    await interaction.editReply(card.toMessage());
  },
};
