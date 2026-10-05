const { TimestampStyles, time } = require('discord.js');
const emojis = require('../config/emojis');

const numberFormat = new Intl.NumberFormat('en-US');

function formatNumber(value) {
  return numberFormat.format(value);
}

/** `1,250 <coin>` in bold — the standard way to show money. */
function coins(value) {
  return `**${formatNumber(value)}** ${emojis.coin}`;
}

/** Human readable duration: 90 → "1m 30s", 86400 → "1d". */
function formatDuration(totalSeconds) {
  let seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds === 0) return '0s';
  const units = [
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
    ['s', 1],
  ];
  const parts = [];
  for (const [label, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount > 0) {
      parts.push(`${amount}${label}`);
      seconds -= amount * size;
    }
  }
  return parts.join(' ');
}

/** Live-updating Discord timestamp ("in 5 minutes"). */
function relativeTime(date) {
  return time(new Date(date), TimestampStyles.RelativeTime);
}

function fullTime(date) {
  return time(new Date(date), TimestampStyles.LongDateTime);
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

module.exports = {
  formatNumber,
  coins,
  formatDuration,
  relativeTime,
  fullTime,
  truncate,
  plural,
};
