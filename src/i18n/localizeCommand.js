const { ApplicationCommandOptionType } = require('discord.js');

// Discord locales that receive each translation file.
const TARGETS = [{ locales: ['es-ES', 'es-419'], dictionary: require('./commands/es') }];

const isContainer = (option) =>
  option.type === ApplicationCommandOptionType.Subcommand ||
  option.type === ApplicationCommandOptionType.SubcommandGroup;

function addLocalization(target, field, locales, text) {
  if (!text) return;
  target[field] = { ...target[field] };
  for (const locale of locales) target[field][locale] = text;
}

function localizeOptions(options, dictionary, locales) {
  for (const option of options ?? []) {
    if (isContainer(option)) {
      const entry = dictionary?.subcommands?.[option.name];
      addLocalization(option, 'description_localizations', locales, entry?.description);
      localizeOptions(option.options, entry, locales);
      continue;
    }
    addLocalization(
      option,
      'description_localizations',
      locales,
      dictionary?.options?.[option.name],
    );
    for (const choice of option.choices ?? []) {
      addLocalization(
        choice,
        'name_localizations',
        locales,
        dictionary?.choices?.[option.name]?.[choice.value],
      );
    }
  }
}

/** Adds the description/choice translations to a command's JSON payload. */
function localizeCommand(json) {
  const result = structuredClone(json);
  for (const { locales, dictionary } of TARGETS) {
    const entry = dictionary[result.name];
    addLocalization(result, 'description_localizations', locales, entry?.description);
    localizeOptions(result.options, entry, locales);
  }
  return result;
}

/** Description of a command node in a given Discord locale (falls back to English). */
function localizedDescription(node, locale) {
  return node.description_localizations?.[locale] ?? node.description;
}

module.exports = { localizeCommand, localizedDescription };
