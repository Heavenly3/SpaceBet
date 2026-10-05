const { randomInt } = require('node:crypto');

/** Integer in [min, max] (both inclusive). */
function randomBetween(min, max) {
  return randomInt(min, max + 1);
}

/** Float in [min, max). */
function randomFloat(min = 0, max = 1) {
  return min + (randomInt(0, 2 ** 32) / 2 ** 32) * (max - min);
}

function pick(items) {
  return items[randomInt(items.length)];
}

/** Fisher–Yates shuffle, returns a new array. */
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** `count` distinct integers from [min, max]. */
function sample(min, max, count) {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return shuffle(pool).slice(0, count);
}

module.exports = { randomBetween, randomFloat, pick, shuffle, sample };
