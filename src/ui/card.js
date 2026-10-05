const {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
  TimestampStyles,
  time,
} = require('discord.js');
const theme = require('../config/theme');

// Discord caps the text of a Components V2 message at 4000 characters.
const MAX_TEXT = 3800;

/**
 * Fluent builder for Components V2 messages. Every reply in the bot is a
 * Card so they all share the same look:
 *
 *   new Card('success').header('Title', 'subtitle', avatarUrl)
 *     .fields([{ name: 'Wallet', value: '100' }]).footer().toMessage();
 */
class Card {
  constructor(color = 'brand') {
    this.container = new ContainerBuilder().setAccentColor(
      typeof color === 'number' ? color : theme.colors[color],
    );
    this.textLength = 0;
  }

  #text(content) {
    const budget = MAX_TEXT - this.textLength;
    const safe = content.length > budget ? `${content.slice(0, budget - 1)}…` : content;
    this.textLength += safe.length;
    return new TextDisplayBuilder().setContent(safe || '​');
  }

  /** Title line, optional subtitle, optional thumbnail on the right. */
  header(title, subtitle, thumbnailUrl) {
    const lines = [`## ${title}`];
    if (subtitle) lines.push(subtitle);
    return this.section(lines.join('\n'), thumbnailUrl);
  }

  /** Text with an optional thumbnail or button next to it. */
  section(content, accessory) {
    if (!accessory) return this.text(content);
    const section = new SectionBuilder().addTextDisplayComponents(this.#text(content));
    if (typeof accessory === 'string') {
      section.setThumbnailAccessory(new ThumbnailBuilder().setURL(accessory));
    } else {
      section.setButtonAccessory(accessory);
    }
    this.container.addSectionComponents(section);
    return this;
  }

  text(content) {
    this.container.addTextDisplayComponents(this.#text(content));
    return this;
  }

  divider({ large = false, visible = true } = {}) {
    this.container.addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(visible)
        .setSpacing(large ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small),
    );
    return this;
  }

  /** Key/value pairs rendered as compact stat lines. */
  fields(entries) {
    const lines = entries.filter(Boolean).map(({ name, value }) => `**${name}**\n${value}`);
    return lines.length ? this.text(lines.join('\n\n')) : this;
  }

  /** Bullet-style list of `label · value` lines. */
  stats(entries) {
    const lines = entries.filter(Boolean).map(({ name, value }) => `${name} · ${value}`);
    return lines.length ? this.text(lines.join('\n')) : this;
  }

  /** Adds one action row per argument (each an array of components). */
  actions(...rows) {
    for (const components of rows) {
      if (!components?.length) continue;
      this.container.addActionRowComponents(new ActionRowBuilder().addComponents(components));
    }
    return this;
  }

  footer(note) {
    const stamp = time(new Date(), TimestampStyles.ShortDateTime);
    const parts = [theme.name, note, stamp].filter(Boolean);
    this.divider().text(`-# ${parts.join(' • ')}`);
    return this;
  }

  toMessage({ ephemeral = false } = {}) {
    let flags = MessageFlags.IsComponentsV2;
    if (ephemeral) flags |= MessageFlags.Ephemeral;
    return {
      components: [this.container],
      flags,
      allowedMentions: { parse: [] },
    };
  }
}

module.exports = { Card };
