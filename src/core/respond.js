/** Replies, or follows up if the interaction was already answered. */
async function respond(interaction, payload) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

/** Resolves after `ms` milliseconds (for small UI animations). */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { respond, wait };
