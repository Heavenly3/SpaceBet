const {
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const settings = require('../../services/settings');
const emojis = require('../../config/emojis');
const { CATEGORIES, TYPES, readField, displayField } = require('../../config/settingsSchema');
const { truncate } = require('../../utils/format');

// Custom IDs of the panel: `config:act:<section>:<action>:<args...>`
const actionId = (section, action, ...args) =>
  ['config', 'act', section, action, ...args].join(':');

function button(section, action, label, emoji, style = ButtonStyle.Secondary, ...args) {
  return new ButtonBuilder()
    .setCustomId(actionId(section, action, ...args))
    .setLabel(label)
    .setEmoji(emoji)
    .setStyle(style);
}

/** A select menu that runs `action` with the picked value. Null when there is nothing to pick. */
function picker(section, action, placeholder, options) {
  if (!options.length) return null;
  return new StringSelectMenuBuilder()
    .setCustomId(actionId(section, action))
    .setPlaceholder(placeholder)
    .addOptions(
      options.slice(0, 25).map((option) => ({
        ...option,
        label: truncate(option.label, 100),
        description: option.description ? truncate(option.description, 100) : undefined,
      })),
    );
}

function modal(section, action, title) {
  return new ModalBuilder().setCustomId(actionId(section, action)).setTitle(truncate(title, 45));
}

function textField(
  id,
  label,
  { description, value, required = true, paragraph = false, max = 100 } = {},
) {
  const input = new TextInputBuilder()
    .setCustomId(id)
    .setStyle(paragraph ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setRequired(required)
    .setMaxLength(max);
  if (value !== undefined) input.setValue(String(value));
  const field = new LabelBuilder().setLabel(truncate(label, 45)).setTextInputComponent(input);
  if (description) field.setDescription(truncate(description, 100));
  return field;
}

/** Numbered list with a "…and N more" tail so long lists fit in one message. */
function list(lines, t, limit = 12) {
  if (lines.length <= limit) return lines.join('\n');
  return [...lines.slice(0, limit), `-# ${t('panel.more', { count: lines.length - limit })}`].join(
    '\n',
  );
}

const fieldText = (t, sectionId, field, part) =>
  t(`config.fields.${sectionId}.${field.id}.${part}`);

/** "Label · value" lines (with explanation) for the settings of a section. */
function settingLines(t, sectionId) {
  return CATEGORIES[sectionId].fields
    .map(
      (field) =>
        `**${fieldText(t, sectionId, field, 'label')}** · ${displayField(field, t)}\n-# ${fieldText(t, sectionId, field, 'help')}`,
    )
    .join('\n');
}

/** Form to edit every value of a schema category. */
function valuesModal(t, sectionId) {
  return modal(
    sectionId,
    'save',
    t('config.modalTitle', { category: t(`config.categories.${sectionId}.label`) }),
  ).addLabelComponents(
    CATEGORIES[sectionId].fields.map((field) =>
      textField(field.id, fieldText(t, sectionId, field, 'label'), {
        description: t(`config.hints.${field.type}`),
        value: TYPES[field.type].input(readField(field)),
        max: 20,
      }),
    ),
  );
}

/** Validates and stores the values form. Returns an error message or null. */
function saveValues(t, sectionId, fields) {
  const category = CATEGORIES[sectionId];
  const values = {};

  for (const field of category.fields) {
    const parsed = TYPES[field.type].parse(fields.getTextInputValue(field.id).trim());
    if (parsed === null || parsed < (field.min ?? 0)) {
      return t('config.invalid', {
        field: fieldText(t, sectionId, field, 'label'),
        hint: t(`config.hints.${field.type}`),
      });
    }
    values[field.id] = parsed;
  }

  const problem = category.validate?.(values);
  if (problem) return t(problem);

  const updates = new Map();
  for (const field of category.fields) {
    if (field.path) {
      const current = updates.get(field.key) ?? settings.get(field.key);
      updates.set(field.key, { ...current, [field.path]: values[field.id] });
    } else {
      updates.set(field.key, values[field.id]);
    }
  }
  for (const [key, value] of updates) settings.set(key, value);
  return null;
}

/** Standard "Edit values" button of a section. */
const editButton = (t, sectionId) =>
  button(sectionId, 'edit', t('config.edit'), emojis.edit, ButtonStyle.Primary);

module.exports = {
  ButtonStyle,
  actionId,
  button,
  picker,
  modal,
  textField,
  list,
  settingLines,
  valuesModal,
  saveValues,
  editButton,
};
