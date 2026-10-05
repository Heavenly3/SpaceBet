// Mission Control: the /config admin panel. Every section lives in
// ./sections/<id>.js and exports { icon, color, render(t, ctx), actions? }.
//
// Actions return what should happen next:
//   { banner }              update the panel with a message on top
//   { confirm, banner }     ask for confirmation before a destructive action
//   { modal }               open a form
//   { error }               reply with a private error
//   { refresh: true, ... }  the language changed: rebuild the translator
const { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const settings = require('../../services/settings');
const ui = require('../../ui');
const emojis = require('../../config/emojis');
const { CATEGORIES } = require('../../config/settingsSchema');
const { resolveLanguage, translator } = require('../../i18n');
const { actionId, saveValues, valuesModal } = require('./shared');

const SECTIONS = {
  general: require('./sections/general'),
  members: require('./sections/members'),
  work: require('./sections/work'),
  collect: require('./sections/collect'),
  wheel: require('./sections/wheel'),
  games: require('./sections/games'),
  shop: require('./sections/shop'),
  loans: require('./sections/loans'),
  raffle: require('./sections/raffle'),
};

// Actions every section with settings gets for free.
const GENERIC = {
  edit: (interaction, args, t, sectionId) => ({ modal: valuesModal(t, sectionId) }),

  save(interaction, args, t, sectionId) {
    const problem = saveValues(t, sectionId, interaction.fields);
    return problem ? { error: problem } : { banner: `${emojis.success} ${t('config.saved')}` };
  },

  reset(interaction, args, t, sectionId) {
    settings.reset(...new Set(CATEGORIES[sectionId].fields.map((field) => field.key)));
    return { banner: `${emojis.reset} ${t('config.restored')}` };
  },

  cancel: (interaction, args, t) => ({ banner: `${emojis.info} ${t('panel.cancelled')}` }),
};

const label = (t, id) => t(`config.categories.${id}.label`);
const description = (t, id) => t(`config.categories.${id}.description`);

function sectionMenu(t, selected) {
  return new StringSelectMenuBuilder()
    .setCustomId('config:view')
    .setPlaceholder(t('config.placeholder'))
    .addOptions(
      Object.entries(SECTIONS).map(([value, section]) => ({
        label: label(t, value),
        description: description(t, value),
        emoji: emojis[section.icon],
        value,
        default: value === selected,
      })),
    );
}

function confirmRow(t, sectionId, { action, args = [] }) {
  return [
    new ButtonBuilder()
      .setCustomId(actionId(sectionId, action, ...args, 'yes'))
      .setLabel(t('panel.confirm'))
      .setEmoji(emojis.success)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(actionId(sectionId, 'cancel'))
      .setLabel(t('panel.cancel'))
      .setStyle(ButtonStyle.Secondary),
  ];
}

/**
 * Builds the panel. `sectionId` null shows the overview.
 * @param {object} state { banner, confirm, guild, ephemeral }
 */
function render(t, sectionId, { banner, confirm, guild, ephemeral = true } = {}) {
  const section = SECTIONS[sectionId];
  const card = new ui.Card(section?.color ?? 'config').header(
    ui.featureTitle(t, 'config'),
    t('config.subtitle'),
  );
  if (banner) card.text(typeof banner === 'function' ? banner(t) : banner);
  card.divider();

  if (!section) {
    card.text(
      Object.entries(SECTIONS)
        .map(([id, s]) => `${emojis[s.icon]} **${label(t, id)}** — ${description(t, id)}`)
        .join('\n'),
    );
    return card
      .actions([sectionMenu(t)])
      .footer()
      .toMessage({ ephemeral });
  }

  const { blocks, rows } = section.render(t, { guild });
  card.text(`### ${emojis[section.icon]} ${label(t, sectionId)}`);
  for (const block of blocks.filter(Boolean)) card.text(block);

  // While confirming, only the confirmation buttons are offered.
  const actionRows = confirm
    ? [confirmRow(t, sectionId, confirm)]
    : [[sectionMenu(t, sectionId)], ...rows.map((row) => row.filter(Boolean))];
  return card
    .divider()
    .actions(...actionRows)
    .footer()
    .toMessage({ ephemeral });
}

/** Runs a panel action: `config:act:<section>:<action>:<args...>`. */
async function handle(interaction, [sectionId, action, ...args], t) {
  const section = SECTIONS[sectionId];
  const handler =
    section?.actions?.[action] ??
    (CATEGORIES[sectionId] || action === 'cancel' ? GENERIC[action] : null);
  if (!handler) return interaction.reply(ui.error(t('config.unknown')));

  const result = await handler(interaction, args, t, sectionId);
  if (!result) return undefined;
  if (result.modal) return interaction.showModal(result.modal);
  if (result.error) return interaction.reply(ui.error(result.error));

  const lang = result.refresh ? translator(resolveLanguage(interaction.locale)) : t;
  const payload = render(lang, sectionId, {
    banner: result.banner,
    confirm: result.confirm,
    guild: interaction.guild,
    ephemeral: false,
  });
  // Forms opened from the panel can update it in place.
  if (interaction.isModalSubmit() && !interaction.isFromMessage())
    return interaction.reply(payload);
  return interaction.update(payload);
}

module.exports = { SECTIONS, render, handle };
