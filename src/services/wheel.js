const settings = require('./settings');
const { coins } = require('../utils/format');

function getRewards() {
  return settings.get('wheel.rewards');
}

/** Display label of a reward: its custom name, or the amount. */
function rewardLabel(reward, t) {
  if (reward.name) {
    return reward.amount > 0
      ? `**${reward.name}** (${coins(reward.amount)})`
      : `**${reward.name}**`;
  }
  return reward.amount > 0 ? coins(reward.amount) : `**${t('wheel.nothing')}**`;
}

module.exports = { getRewards, rewardLabel };
