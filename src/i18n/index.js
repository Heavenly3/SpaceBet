const settings = require('../services/settings');

const LOCALES = {
  en: require('./locales/en'),
  es: require('./locales/es'),
};

const LANGUAGES = Object.keys(LOCALES);
const FALLBACK = 'en';

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary);
}

/**
 * Translates `key` (dot path) into `lang`, falling back to English.
 * Entries may be strings with {placeholders} or functions of the vars.
 */
function translate(lang, key, vars = {}) {
  let entry = lookup(LOCALES[lang], key);
  if (entry === undefined) entry = lookup(LOCALES[FALLBACK], key);
  if (entry === undefined) return key;
  if (typeof entry === 'function') return entry(vars);
  if (typeof entry !== 'string') return entry;
  return entry.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/** Maps a Discord locale (e.g. "es-ES", "es-419", "en-US") to a bot language. */
function fromDiscordLocale(locale) {
  const base = String(locale ?? '').split('-')[0];
  return LANGUAGES.includes(base) ? base : FALLBACK;
}

/**
 * Language used to talk to someone: the server setting, or their own
 * Discord language when the setting is "auto".
 */
function resolveLanguage(locale) {
  const configured = settings.get('general.language');
  return configured === 'auto' ? fromDiscordLocale(locale) : configured;
}

/** A translator bound to one language: t('key', vars). */
function translator(lang) {
  const t = (key, vars) => translate(lang, key, vars);
  t.lang = lang;
  return t;
}

module.exports = { LANGUAGES, translate, translator, resolveLanguage, fromDiscordLocale };
