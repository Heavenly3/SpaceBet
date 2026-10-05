const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const cooldowns = require('../../services/cooldowns');
const settings = require('../../services/settings');
const work = require('../../services/work');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { mention } = require('../../core/commandMentions');
const { coins, relativeTime } = require('../../utils/format');
const { pick, randomBetween } = require('../../utils/random');

module.exports = {
  cooldown: 'work.cooldown',

  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Take a job across the galaxy and earn some coins.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { t }) {
    const { user } = interaction;
    const remaining = cooldowns.remaining(user.id, 'work');
    if (remaining) return interaction.reply(ui.cooldown(t, remaining, t('work.action')));

    const messages = work.getMessages(t);
    if (messages.length === 0) {
      return interaction.reply(ui.warning(t('work.noJobs', { command: mention('config') })));
    }

    const { min, max } = settings.get('work.range');
    const earnings = randomBetween(min, max);
    economy.getAccount(user);
    economy.credit(user.id, earnings);
    const readyAt = cooldowns.startConfigured(user.id, 'work');

    const template = pick(messages);
    const story = template.includes('{amount}')
      ? template.replaceAll('{amount}', coins(earnings))
      : t('work.fallback', { message: template, amount: coins(earnings) });

    const card = new ui.Card('work')
      .header(`${emojis.work} ${t('work.title')}`, story, user.displayAvatarURL({ size: 128 }))
      .divider()
      .stats([
        {
          name: `${emojis.wallet} ${t('common.wallet')}`,
          value: coins(economy.findAccount(user.id).wallet),
        },
        { name: `${emojis.cooldown} ${t('work.next')}`, value: relativeTime(readyAt) },
      ])
      .footer(t('features.work'));

    await interaction.reply(card.toMessage());
  },
};
