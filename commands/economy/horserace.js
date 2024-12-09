const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

const horseNames = [
  'Thunderbolt',
  'Lightning',
  'Storm',
  'Tornado',
  'Blizzard',
  'Hurricane',
  'Cyclone',
  'Typhoon',
  'Tempest',
  'Gale',
];

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
    .addIntegerOption((option) =>
      option
        .setName('horse')
        .setDescription('Horse number to bet on (1-10)')
        .setRequired(true),
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
    const horse = interaction.options.getInteger('horse');

    if (horse < 1 || horse > 10) {
      return interaction.reply({
        content: 'Please choose a horse number between 1 and 10.',
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

    const positions = Array.from({ length: 10 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5,
    );
    const winningHorse = positions[0];
    const betHorsePosition = positions.indexOf(horse) + 1;

    const rewardMultipliers = { 1: 6, 2: 4, 3: 2 };
    const rewardMultiplier = rewardMultipliers[betHorsePosition] || 0;
    const payout = amount * rewardMultiplier;

    const positionsList = positions
      .map((horseNumber, i) => {
        const rewardText = rewardMultipliers[i + 1]
          ? `(x${rewardMultipliers[i + 1]})`
          : `(0%)`;

        const arrow =
          horseNumber === horse ? ` <:astronaut:1310015130989367337>` : '';
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
