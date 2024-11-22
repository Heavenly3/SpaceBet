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

    const positions = Array.from({ length: 10 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5,
    );
    const winningHorse = positions[0];

    const betHorsePosition = positions.indexOf(horse) + 1;

    let payout = 0;
    let rewardMultiplier = 0;

    switch (betHorsePosition) {
      case 1:
        rewardMultiplier = 6;
        break;
      case 2:
        rewardMultiplier = 4;
        break;
      case 3:
        rewardMultiplier = 2;
        break;
      default:
        rewardMultiplier = 0;
    }

    payout = amount * rewardMultiplier;

    let positionsList = '';
    for (let i = 0; i < positions.length; i++) {
      const horseNumber = positions[i];
      const horseName = horseNames[horseNumber - 1];
      let rewardText = '';

      if (i === 0) {
        rewardText = `(x6)`;
      } else if (i === 1) {
        rewardText = `(x4)`;
      } else if (i === 2) {
        rewardText = `(x2)`;
      } else {
        rewardText = `(0%)`;
      }

      positionsList += `\` ${horseNumber} \` **${horseName}** ${rewardText}\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(rewardMultiplier > 0 ? 0x00ff00 : 0xff0000)
      .setTitle(
        rewardMultiplier > 0
          ? '🎉 Congratulations!'
          : '😞 Better Luck Next Time!',
      )
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1305567738349092964/horse2.png?ex=67338035&is=67322eb5&hm=a4dd4a510bf3bc260f2434778b2da99fc3827c4c9c0f5949cd5c538add8822dd&',
      )
      .setDescription(
        rewardMultiplier > 0
          ? `**Horse number ${winningHorse} won the race!**\n\nYour horse finished in position ${betHorsePosition}. You won **${payout} <:money:1305557747017973791>**!\n\n**Race Results:**\n${positionsList}`
          : `**Horse number ${winningHorse} won the race.**\n\nYour horse finished in position ${betHorsePosition}. You lost **${amount} <:money:1305557747017973791>**.\nBetter luck next time!\n\n**Race Results:**\n${positionsList}`,
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    if (rewardMultiplier > 0) {
      user.wallet += payout;
    } else {
      user.wallet -= amount;
    }

    await user.save();
    await interaction.reply({ embeds: [embed] });
  },
};
