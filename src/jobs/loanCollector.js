const loans = require('../services/loans');
const economy = require('../services/economy');
const { Card } = require('../ui');
const emojis = require('../config/emojis');
const { resolveLanguage, translator } = require('../i18n');
const { coins } = require('../utils/format');
const log = require('../core/logger').child('loans');

module.exports = async function collectLoans(client) {
  for (const loan of loans.collectOverdue()) {
    log.info(
      `Collected overdue loan of ${loan.amount_due} from ${loan.user_id} (shortfall ${loan.shortfall}).`,
    );

    // DMs use the language the member last used with the bot.
    const t = translator(resolveLanguage(economy.findAccount(loan.user_id)?.locale));
    const card = new Card(loan.shortfall > 0 ? 'danger' : 'loans')
      .header(`${emojis.loan} ${t('loans.collectedTitle')}`, t('loans.collectedBody'))
      .divider()
      .fields([
        { name: `${emojis.bill} ${t('loans.collectedAmount')}`, value: coins(loan.amount_due) },
        loan.shortfall > 0 && {
          name: `${emojis.warning} ${t('loans.debtLeft')}`,
          value: t('loans.debtLeftValue', { amount: coins(loan.shortfall) }),
        },
      ])
      .footer(t('features.loans'));

    try {
      const user = await client.users.fetch(loan.user_id);
      await user.send(card.toMessage());
    } catch {
      // DMs closed — the collection itself already happened.
    }
  }
};
