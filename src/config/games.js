const emojis = require('./emojis');

// All multipliers are TOTAL returns (stake included): 2 means the player
// gets back double their bet. Every game keeps a small house edge so the
// economy cannot be farmed.
module.exports = {
  minBet: 100,

  slots: {
    symbols: Object.values(emojis.reels),
    jackpotSymbol: emojis.reels.seven,
    payouts: { pair: 1.5, triple: 10, jackpot: 25 },
  },

  roulette: {
    redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    bets: {
      red: { label: 'Red', multiplier: 2 },
      black: { label: 'Black', multiplier: 2 },
      even: { label: 'Even', multiplier: 2 },
      odd: { label: 'Odd', multiplier: 2 },
      low: { label: 'Low (1-18)', multiplier: 2 },
      high: { label: 'High (19-36)', multiplier: 2 },
      dozen1: { label: '1st dozen (1-12)', multiplier: 3 },
      dozen2: { label: '2nd dozen (13-24)', multiplier: 3 },
      dozen3: { label: '3rd dozen (25-36)', multiplier: 3 },
      column1: { label: '1st column', multiplier: 3 },
      column2: { label: '2nd column', multiplier: 3 },
      column3: { label: '3rd column', multiplier: 3 },
      straight: { label: 'Single number (0-36)', multiplier: 36 },
    },
  },

  horserace: {
    horses: [
      'Thunderbolt',
      'Lightning',
      'Storm',
      'Tornado',
      'Blizzard',
      'Hurricane',
      'Cyclone',
      'Typhoon',
      'Tempest',
      'Gale',
    ],
    payouts: { 1: 6, 2: 2, 3: 1 },
  },

  keno: {
    poolSize: 80,
    drawSize: 20,
    maxSpots: 10,
    // paytable[spots][matches] = multiplier
    paytable: {
      1: { 1: 3.6 },
      2: { 2: 15 },
      3: { 2: 3, 3: 35 },
      4: { 2: 1.5, 3: 5, 4: 110 },
      5: { 3: 3, 4: 25, 5: 600 },
      6: { 3: 2, 4: 7, 5: 90, 6: 1500 },
      7: { 3: 1, 4: 4, 5: 20, 6: 300, 7: 5000 },
      8: { 5: 18, 6: 140, 7: 1200, 8: 20000 },
      9: { 4: 1, 5: 4, 6: 45, 7: 400, 8: 4000, 9: 25000 },
      10: { 0: 3, 5: 2, 6: 22, 7: 140, 8: 1000, 9: 5000, 10: 50000 },
    },
  },

  rob: {
    successChance: 0.45,
    minTargetWallet: 100,
    minThiefWallet: 250,
    stealPercent: { min: 0.1, max: 0.4 },
    finePercent: { min: 0.1, max: 0.25 },
  },

  raffle: {
    maxNumber: 999,
  },
};
