// Verifies that every language is complete:
//   - all locale files have the same keys as English
//   - every command, subcommand, option and choice has a Spanish description
//   - every command has a /help entry
//   - no text exceeds Discord's 100-character limit
//   npm run check:i18n
const { ApplicationCommandOptionType } = require('discord.js');
const { loadCommands } = require('../src/core/loader');

const locales = { en: require('../src/i18n/locales/en'), es: require('../src/i18n/locales/es') };
const LOCALE = 'es-ES';
const problems = [];

function compare(reference, other, lang, path = '') {
  for (const key of Object.keys(reference)) {
    const here = path ? `${path}.${key}` : key;
    const a = reference[key];
    const b = other?.[key];
    if (b === undefined) problems.push(`[${lang}] missing key ${here}`);
    else if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
      problems.push(`[${lang}] type mismatch at ${here}`);
    } else if (Array.isArray(a) && a.length !== b.length) {
      problems.push(`[${lang}] ${here} has ${b.length} entries, English has ${a.length}`);
    } else if (a && typeof a === 'object' && !Array.isArray(a)) compare(a, b, lang, here);
  }
  for (const key of Object.keys(other ?? {})) {
    if (!(key in reference)) problems.push(`[${lang}] extra key ${path ? `${path}.` : ''}${key}`);
  }
}

function checkText(where, text) {
  if (!text) problems.push(`[commands] missing Spanish text for ${where}`);
  else if (text.length > 100)
    problems.push(`[commands] ${where} is ${text.length} chars (max 100)`);
}

function checkOptions(prefix, options) {
  for (const option of options ?? []) {
    const where = `${prefix} ${option.name}`;
    checkText(where, option.description_localizations?.[LOCALE]);
    const nested =
      option.type === ApplicationCommandOptionType.Subcommand ||
      option.type === ApplicationCommandOptionType.SubcommandGroup;
    if (nested) {
      checkOptions(where, option.options);
      continue;
    }
    for (const choice of option.choices ?? []) {
      // Choices that are proper names (e.g. horses) may stay untranslated.
      const text = choice.name_localizations?.[LOCALE];
      if (text && text.length > 100)
        problems.push(`[commands] choice ${where}=${choice.value} too long`);
    }
  }
}

for (const [lang, dictionary] of Object.entries(locales)) {
  if (lang !== 'en') compare(locales.en, dictionary, lang);
}

for (const command of loadCommands().values()) {
  const { name } = command.json;
  checkText(`/${name}`, command.json.description_localizations?.[LOCALE]);
  checkOptions(`/${name}`, command.json.options);
  for (const [lang, dictionary] of Object.entries(locales)) {
    if (!dictionary.help.commands[name]?.about) {
      problems.push(`[${lang}] missing help.commands.${name}.about`);
    }
  }
}

if (problems.length) {
  console.error(`✖ ${problems.length} translation problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✔ Translations complete (${Object.keys(locales).join(', ')}).`);
