// Every setting editable from /config, grouped by category. Labels and
// explanations live in the locale files under config.categories / config.fields.
// `path` targets a property inside an object setting (e.g. work.range.min).
const settings = require('../services/settings');
const { LANGUAGES } = require('../i18n');
const { coins, formatDuration } = require('../utils/format');
const { parseDuration } = require('../utils/parse');

const CATEGORIES = {
  general: {
    icon: 'config',
    fields: [{ id: 'language', key: 'general.language', type: 'language' }],
  },
  work: {
    icon: 'work',
    fields: [
      { id: 'min', key: 'work.range', path: 'min', type: 'coins' },
      { id: 'max', key: 'work.range', path: 'max', type: 'coins' },
      { id: 'cooldown', key: 'work.cooldown', type: 'duration' },
    ],
    validate: (values) => (values.min > values.max ? 'config.minMax' : null),
  },
  collect: {
    icon: 'collect',
    fields: [{ id: 'cooldown', key: 'collect.cooldown', type: 'duration' }],
  },
  wheel: {
    icon: 'wheel',
    fields: [{ id: 'cooldown', key: 'wheel.cooldown', type: 'duration' }],
  },
  games: {
    icon: 'slots',
    fields: [
      { id: 'slots', key: 'slots.cooldown', type: 'duration' },
      { id: 'roulette', key: 'roulette.cooldown', type: 'duration' },
      { id: 'horserace', key: 'horserace.cooldown', type: 'duration' },
      { id: 'keno', key: 'keno.cooldown', type: 'duration' },
      { id: 'rob', key: 'rob.cooldown', type: 'duration' },
    ],
  },
  loans: {
    icon: 'loan',
    fields: [
      { id: 'rate', key: 'loan.interestRate', type: 'percent' },
      { id: 'duration', key: 'loan.duration', type: 'duration' },
      { id: 'max', key: 'loan.maxAmount', type: 'coins', min: 1 },
    ],
  },
  raffle: {
    icon: 'raffle',
    fields: [
      { id: 'price', key: 'raffle.ticketPrice', type: 'coins', min: 1 },
      { id: 'pot', key: 'raffle.basePot', type: 'coins' },
      { id: 'delay', key: 'raffle.drawDelay', type: 'duration' },
    ],
  },
};

const digitsOnly = (text) => text.replace(/[,._\s]/g, '');

const TYPES = {
  coins: {
    display: (value) => coins(value),
    input: (value) => String(value),
    parse: (text) => (/^\d+$/.test(digitsOnly(text)) ? Number(digitsOnly(text)) : null),
  },
  percent: {
    display: (value) => `${value}%`,
    input: (value) => String(value),
    parse: (text) => {
      const value = Number(text.replace('%', '').trim());
      return Number.isInteger(value) && value >= 0 && value <= 1000 ? value : null;
    },
  },
  duration: {
    display: (value) => formatDuration(value),
    input: (value) => formatDuration(value).replaceAll(' ', ''),
    parse: (text) => {
      const seconds = parseDuration(text);
      return seconds && seconds > 0 && seconds <= 365 * 86400 ? seconds : null;
    },
  },
  language: {
    display: (value, t) => t(`config.languages.${value}`),
    parse: (text) => (text === 'auto' || LANGUAGES.includes(text) ? text : null),
  },
};

function readField(field) {
  const value = settings.get(field.key);
  return field.path ? value[field.path] : value;
}

function displayField(field, t) {
  return TYPES[field.type].display(readField(field), t);
}

module.exports = { CATEGORIES, TYPES, readField, displayField };
