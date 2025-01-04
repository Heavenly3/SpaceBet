const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/datahorse.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const horseNames = data.horseNames;
const defaultCooldown = data.defaultCooldown;

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('horserace')
    .setDescription('Bet on a horse race')
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Bet amount (e.g., 100 or all)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('horse')
        .setDescription('Select the horse to bet on')
        .setRequired(true)
        .addChoices(
          ...horseNames.map((name, index) => ({
            name: `${index + 1}: ${name}`,
            value: `${index + 1}`,
          })),
        ),
    ),

  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to place a bet.',
        ephemeral: true,
      });
    }

    const bet = interaction.options.getString('bet');
    const horse = interaction.options.getString('horse');

    const horseIndex = parseInt(horse);
    if (isNaN(horseIndex) || horseIndex < 1 || horseIndex > 10) {
      return interaction.reply({
        content: 'Please choose a horse from the list.',
        ephemeral: true,
      });
    }

    const amount = bet === 'all' ? user.wallet : parseInt(bet);
    if (isNaN(amount) || amount <= 0 || amount > user.wallet) {
      return interaction.reply({
        content: 'Enter a valid bet amount that you can afford.',
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
          content: `⏳ Please wait ${timeLeft.toFixed(1)} more seconds before betting again.`,
          ephemeral: true,
        });
      }
    }

    cooldowns.set(userId, now);

    const positions = Array.from({ length: 10 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5,
    );
    const winningHorse = positions[0];
    const betHorsePosition = positions.indexOf(horseIndex) + 1;

    const rewardMultipliers = { 1: 6, 2: 4, 3: 2 };
    const rewardMultiplier = rewardMultipliers[betHorsePosition] || 0;
    const payout = amount * rewardMultiplier;

    const positionsList = positions
      .map((horseNumber, i) => {
        const rewardText = rewardMultipliers[i + 1]
          ? `(x${rewardMultipliers[i + 1]})`
          : `(0%)`;

        const arrow =
          horseNumber === horseIndex ? ` <:astronaut:1310015130989367337>` : '';
        return `\` ${horseNumber} \` **${horseNames[horseNumber - 1]}** ${rewardText}${arrow}`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(rewardMultiplier > 0 ? 0x00ff00 : 0xff0000)
      .setTitle(
        rewardMultiplier > 0
          ? '🎉 Congratulations!'
          : '😞 Better Luck Next Time!',
      )
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1309993093960957972/horse.png',
      )
      .setDescription(
        rewardMultiplier > 0
          ? `**Horse number ${winningHorse} won the race!**\n\nYour horse finished in position ${betHorsePosition}. You won **${payout} <:disk:1309988409208475730>**!\n\n**Race Results:**\n${positionsList}`
          : `**Horse number ${winningHorse} won the race.**\n\nYour horse finished in position ${betHorsePosition}. You lost **${amount} <:disk:1309988409208475730>**.\nBetter luck next time!\n\n**Race Results:**\n${positionsList}`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    user.wallet += rewardMultiplier > 0 ? payout : -amount;
    await user.save();

    await interaction.reply({ embeds: [embed] });
  },
};
