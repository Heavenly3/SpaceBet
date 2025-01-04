const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/dataroulette.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const rouletteOptions = data.rouletteOptions;
const defaultCooldown = data.defaultCooldown;

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Place a bet on the roulette')
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Bet amount (e.g., 100 or all)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('choice')
        .setDescription(
          'Bet choice (e.g., red, black, odd, even, 1-18, 19-36, 1-12, etc.)',
        )
        .setRequired(true)
        .addChoices(
          ...Object.keys(rouletteOptions).map((choice) => ({
            name: choice,
            value: choice,
          })),
        ),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to play roulette.',
        ephemeral: true,
      });
    }

    const bet = interaction.options.getString('bet');
    const choice = interaction.options.getString('choice').toLowerCase();

    let amount;
    if (bet === 'all') {
      amount = user.wallet;
    } else {
      amount = parseInt(bet);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          content: 'Please enter a valid bet amount.',
          ephemeral: true,
        });
      }
    }

    if (amount > user.wallet) {
      return interaction.reply({
        content:
          'You do not have enough money in your wallet to place this bet.',
        ephemeral: true,
      });
    }

    if (amount <= 0) {
      return interaction.reply({
        content: 'You must place a positive bet amount.',
        ephemeral: true,
      });
    }

    if (
      !rouletteOptions[choice] &&
      (isNaN(choice) || choice < 0 || choice > 36)
    ) {
      return interaction.reply({
        content: 'Please enter a valid bet choice.',
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
          content: `⏳ Please wait ${timeLeft.toFixed(1)} more seconds before placing another bet.`,
          ephemeral: true,
        });
      }
    }

    cooldowns.set(userId, now);

    const number = Math.floor(Math.random() * 37);
    const color = number === 0 ? 'green' : number % 2 === 0 ? 'black' : 'red';

    let win = false;
    let payout = 0;
    let winType = '';

    if (rouletteOptions[choice]) {
      const betOption = rouletteOptions[choice];
      if (betOption.type === 'color' && betOption.color === color) {
        win = true;
        payout = amount * 2;
        winType = 'color';
      } else if (
        betOption.type === 'parity' &&
        ((betOption.parity === 'even' && number % 2 === 0) ||
          (betOption.parity === 'odd' && number % 2 !== 0))
      ) {
        win = true;
        payout = amount * 2;
        winType = 'parity';
      } else if (
        betOption.type === 'range' &&
        number >= betOption.min &&
        number <= betOption.max
      ) {
        win = true;
        payout = amount * 2;
        winType = 'range';
      } else if (
        betOption.type === 'dozen' &&
        Math.floor((number - 1) / 12) + 1 === betOption.dozen
      ) {
        win = true;
        payout = amount * 3;
        winType = 'dozen';
      } else if (
        betOption.type === 'column' &&
        number % 3 === betOption.column - 1
      ) {
        win = true;
        payout = amount * 3;
        winType = 'column';
      }
    } else if (parseInt(choice) === number) {
      win = true;
      payout = amount * 36;
      winType = 'number';
    }

    const embed = new EmbedBuilder()
      .setColor(win ? 0x00ff00 : 0xff0000)
      .setTitle(win ? '🎉 Congratulations!' : '😞 Better Luck Next Time!')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1305560537039507518/roulette.png?ex=67337980&is=67322800&hm=ec80ce6c705967cc20e3e72abfd3e99cb221baf3cd5013b4d4630864c908edc9&',
      )
      .setDescription(
        win
          ? `**The roulette landed on ${number} ${color}!**\n\nYou won **${payout} <:disk:1309988409208475730>** with a ${winType} bet!`
          : `**The roulette landed on ${number} ${color}.**\n\nYou lost **${amount} <:disk:1309988409208475730>**. Better luck next time!`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    if (win) {
      user.wallet += payout;
    } else {
      user.wallet -= amount;
    }

    await user.save();
    await interaction.reply({ embeds: [embed] });
  },
};
