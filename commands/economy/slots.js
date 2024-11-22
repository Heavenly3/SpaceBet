const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

const symbols = [
  '<:apple:1305946916802003016>',
  '<:lemon:1305946897240035388>',
  '<:watermelon:1305946877165834380>',
  '<:orange:1305946846274912339>',
  '<:seven:1305946825945124896>',
  '<:strawberry:1305946808677040198>',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine')
    .addStringOption((option) =>
      option
        .setName('bet')
        .setDescription('Bet amount (e.g., 100 or all, minimum 100)')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You need to have an account to play the slot machine.',
        ephemeral: true,
      });
    }

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

    await interaction.deferReply();

    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

    const animationSteps = [
      {
        content: `# **Spinning...**\n\n# <a:SpinningCat:1305965200989749309> <a:SpinningCat:1305965200989749309> <a:SpinningCat:1305965200989749309>`,
        ephemeral: false,
      },
      {
        content: `# **Spinning...**\n\n# ${reel1} <a:SpinningCat:1305965200989749309> <a:SpinningCat:1305965200989749309>`,
        ephemeral: false,
      },
      {
        content: `# **Spinning...**\n\n# ${reel1} ${reel2} <a:SpinningCat:1305965200989749309>`,
        ephemeral: false,
      },
      {
        content: `# **Spinning...**\n\n# ${reel1} ${reel2} ${reel3}`,
        ephemeral: false,
      },
    ];

    let win = false;
    let payout = 0;

    if (reel1 === reel2 && reel2 === reel3) {
      win = true;
      payout = betAmount * 10;
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      win = true;
      payout = betAmount * 2;
    }

    const resultEmbed = new EmbedBuilder()
      .setColor(win ? 0x00ff00 : 0xff0000)
      .setTitle(win ? '🎉 Jackpot!' : '😞 Try Again!')
      .setDescription(
        win
          ? `**${reel1} ${reel2} ${reel3}**\n\nYou won **${payout} <:money:1305557747017973791>**!`
          : `**${reel1} ${reel2} ${reel3}**\n\nYou lost **${betAmount} <:money:1305557747017973791>**. Better luck next time!`,
      )
      .setTimestamp()
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1305972688896004238/gamble0.png?ex=6734f958&is=6733a7d8&hm=0fbe5335b6c4d48d37669d21430e4470e69b13134cc8a17a5b62897361061286&',
      )
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    if (win) {
      user.wallet += payout;
    } else {
      user.wallet -= betAmount;
    }

    await user.save();

    for (const step of animationSteps) {
      await interaction.editReply(step);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await interaction.editReply({ content: null, embeds: [resultEmbed] });
  },
};
