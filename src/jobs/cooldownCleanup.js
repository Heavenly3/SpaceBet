const cooldowns = require('../services/cooldowns');

module.exports = async function cleanupCooldowns() {
  cooldowns.purgeExpired();
};
