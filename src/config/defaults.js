// Default values for every setting that admins can change at runtime
// from the /config panel. Durations are in seconds.
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

module.exports = {
  // 'auto' replies in each member's Discord language; or force 'en' / 'es'.
  'general.language': 'auto',

  'work.messages': [
    'You repaired a hyperdrive on a stranded freighter and earned {amount}.',
    'You mapped an uncharted nebula and sold the data for {amount}.',
    'You mined asteroid ore in the outer belt and made {amount}.',
    'You escorted a cargo convoy through pirate space and were paid {amount}.',
    'You calibrated the station telescopes and earned {amount}.',
  ],
  'work.range': { min: 50, max: 250 },
  'work.cooldown': HOUR,

  'collect.cooldown': DAY,

  'wheel.rewards': [
    { name: null, amount: 100 },
    { name: null, amount: 250 },
    { name: null, amount: 500 },
    { name: null, amount: 1000 },
    { name: null, amount: 0 },
    { name: null, amount: 2000 },
    { name: null, amount: 5000 },
    { name: null, amount: 0 },
    { name: null, amount: 10000 },
    { name: null, amount: 0 },
  ],
  'wheel.cooldown': DAY,

  'slots.cooldown': 30,
  'roulette.cooldown': 30,
  'horserace.cooldown': 30,
  'keno.cooldown': 30,
  'rob.cooldown': 2 * HOUR,

  'loan.interestRate': 10,
  'loan.duration': DAY,
  'loan.maxAmount': 50000,

  'raffle.ticketPrice': 100,
  'raffle.basePot': 500,
  'raffle.drawDelay': 10 * MINUTE,
};
