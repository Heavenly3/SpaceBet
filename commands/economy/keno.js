const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/datakeno.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const payouts = data.payouts;
const defaultCooldown = data.defaultCooldown;

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('keno')
    .setDescription('Play a game of Keno')
    .addStringOption((option) =>
      option
        .setName('numbers')
        .setDescription(
          'Your chosen numbers (separated by commas, e.g., 1,2,3)',
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Your bet amount (e.g., 100 or all, minimum 100)')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to play Keno.',
        ephemeral: true,
      });
    }

    const chosenNumbers = interaction.options
      .getString('numbers')
      .split(',')
      .map(Number);
    const bet = interaction.options.getString('bet');
    let betAmount;

    if (bet.toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(bet);
      if (isNaN(betAmount) || betAmount < 100) {
        return interaction.reply({
          content: 'Please enter a valid bet amount (minimum 100).',
          ephemeral: true,
        });
      }
    }

    if (user.wallet < 100) {
      return interaction.reply({
        content:
          'You do not have enough money to play. The minimum bet amount is 100.',
        ephemeral: true,
      });
    }

    if (user.wallet < betAmount) {
      return interaction.reply({
        content:
          'You do not have enough money in your wallet to place this bet.',
        ephemeral: true,
      });
    }

    if (
      chosenNumbers.some(isNaN) ||
      chosenNumbers.length < 1 ||
      chosenNumbers.length > 20 ||
      !chosenNumbers.every((n) => n >= 1 && n <= 80)
    ) {
      return interaction.reply({
        content:
          'Please enter between 1 and 20 valid numbers between 1 and 80.',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const now = Date.now();

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + defaultCooldown * 1000;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({
          content: `⏳ Please wait ${timeLeft.toFixed(1)} more seconds before playing Keno again.`,
          ephemeral: true,
        });
      }
    }

    cooldowns.set(userId, now);

    user.wallet -= betAmount;
    await user.save();

    const winningNumbers = [];
    while (winningNumbers.length < 20) {
      const num = Math.floor(Math.random() * 80) + 1;
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num);
      }
    }

    const matches = chosenNumbers.filter((num) =>
      winningNumbers.includes(num),
    ).length;

    const payoutMultiplier = payouts[matches] || 0;
    const payout = betAmount * payoutMultiplier;

    if (payout > 0) {
      user.wallet += payout;
    }
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(payout > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🎲 Keno Results 🎲')
      .setDescription(
        `**Your Numbers:** ${chosenNumbers.join(', ')}\n**Winning Numbers:** ${winningNumbers.join(', ')}\n**Matches:** ${matches}\n\n**${payout > 0 ? `You won ${payout} <:disk:1309988409208475730>!` : `You lost ${betAmount} <:disk:1309988409208475730>. Better luck next time!`}**`,
      )
      .setTimestamp()
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1305976540403601469/keno.png?ex=6734fcef&is=6733ab6f&hm=dd10afb290f3e88cef27a27caf2d8984701b764c73503f09c1aad20b1e3494e9&',
      )
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
