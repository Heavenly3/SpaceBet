const { Card } = require('./card');
const notices = require('./notices');
const emojis = require('../config/emojis');

// Icon of every feature (keys of config/emojis.js).
const FEATURE_ICONS = {
  balance: 'planet',
  bank: 'bank',
  work: 'work',
  collect: 'collect',
  wheel: 'wheel',
  rob: 'rob',
  leaderboard: 'rank',
  slots: 'slots',
  roulette: 'roulette',
  horserace: 'horse',
  keno: 'keno',
  raffle: 'raffle',
  loans: 'loan',
  shop: 'shop',
  inventory: 'inventory',
  config: 'config',
  help: 'help',
};

/** Themed title of a feature, e.g. "🎰 Nebula Slots" or "🎰 Nebula Slots — Results". */
function featureTitle(t, feature, suffix) {
  const title = `${emojis[FEATURE_ICONS[feature]]} ${t(`features.${feature}`)}`;
  return suffix ? `${title} — ${suffix}` : title;
}

module.exports = { Card, featureTitle, ...notices };
