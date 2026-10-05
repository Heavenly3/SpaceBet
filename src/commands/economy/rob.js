const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const economy = require('../../services/economy');
const cooldowns = require('../../services/cooldowns');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { rob: config } = require('../../config/games');
const { coins, relativeTime } = require('../../utils/format');
const { randomFloat } = require('../../utils/random');
const { transaction } = require('../../database');

module.exports = {
  cooldown: 'rob.cooldown',

  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription("Try to steal from another member's wallet. Risky!")
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) =>
      option.setName('user').setDescription('Your victim').setRequired(true),
    ),

  async execute(interaction, { t }) {
    const thief = interaction.user;
    const target = interaction.options.getUser('user');

    if (target.id === thief.id) return interaction.reply(ui.error(t('rob.self')));
    if (target.bot) return interaction.reply(ui.error(t('rob.bot')));

    const remaining = cooldowns.remaining(thief.id, 'rob');
    if (remaining) return interaction.reply(ui.cooldown(t, remaining, t('rob.action')));

    const thiefAccount = economy.getAccount(thief);
    const targetAccount = economy.getAccount(target);

    if (thiefAccount.wallet < config.minThiefWallet) {
      return interaction.reply(
        ui.error(t('rob.thiefPoor', { amount: coins(config.minThiefWallet) })),
      );
    }
    if (targetAccount.wallet < config.minTargetWallet) {
      return interaction.reply(ui.error(t('rob.targetPoor', { target })));
    }

    const success = randomFloat() < config.successChance;
    const amount = transaction(() => {
      if (success) {
        const percent = randomFloat(config.stealPercent.min, config.stealPercent.max);
        const wanted = Math.max(1, Math.floor(targetAccount.wallet * percent));
        const stolen = economy.debitUpTo(target.id, wanted);
        economy.credit(thief.id, stolen);
        return stolen;
      }
      const percent = randomFloat(config.finePercent.min, config.finePercent.max);
      const fine = economy.debitUpTo(
        thief.id,
        Math.max(1, Math.floor(thiefAccount.wallet * percent)),
      );
      economy.credit(target.id, fine);
      return fine;
    });
    const readyAt = cooldowns.startConfigured(thief.id, 'rob');

    const card = new ui.Card(success ? 'rob' : 'danger')
      .header(
        success
          ? `${emojis.rob} ${t('rob.successTitle')}`
          : `${emojis.busted} ${t('rob.failTitle')}`,
        success
          ? t('rob.successBody', { target, amount: coins(amount) })
          : t('rob.failBody', { target, amount: coins(amount) }),
        thief.displayAvatarURL({ size: 128 }),
      )
      .divider()
      .stats([
        {
          name: `${emojis.wallet} ${t('common.yourWallet')}`,
          value: coins(economy.findAccount(thief.id).wallet),
        },
        { name: `${emojis.cooldown} ${t('rob.next')}`, value: relativeTime(readyAt) },
      ])
      .footer(t('features.rob'));

    const message = card.toMessage();
    message.allowedMentions = { users: [target.id] };
    await interaction.reply(message);
  },
};
