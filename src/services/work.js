const settings = require('./settings');

/**
 * Job messages of /work. Until an admin customises them, the built-in
 * messages are shown in the language of each reply.
 */
function getMessages(t) {
  return settings.isCustom('work.messages')
    ? settings.get('work.messages')
    : [...t('work.defaultMessages')];
}

module.exports = { getMessages };
