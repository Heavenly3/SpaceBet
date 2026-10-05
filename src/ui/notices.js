const { Card } = require('./card');
const emojis = require('../config/emojis');
const { relativeTime } = require('../utils/format');

const KINDS = {
  success: { color: 'success', icon: emojis.success },
  error: { color: 'danger', icon: emojis.error },
  warning: { color: 'warning', icon: emojis.warning },
  info: { color: 'info', icon: emojis.info },
};

/** Small single-line message. Ephemeral by default. */
function notice(kind, message, { ephemeral = true } = {}) {
  const { color, icon } = KINDS[kind];
  return new Card(color).text(`${icon} ${message}`).toMessage({ ephemeral });
}

const error = (message, options) => notice('error', message, options);
const warning = (message, options) => notice('warning', message, options);
const success = (message, options) => notice('success', message, options);
const info = (message, options) => notice('info', message, options);

/** "You can work again in 5 minutes" with a live Discord timestamp. */
function cooldown(t, remainingMs, action) {
  return notice(
    'warning',
    `${emojis.cooldown} ${t('common.cooldown', { action, time: relativeTime(Date.now() + remainingMs) })}`,
  );
}

module.exports = { notice, error, warning, success, info, cooldown };
