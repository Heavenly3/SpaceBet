const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

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

    const payouts = [0, 3, 12, 43, 130, 820, 1600];
    const payoutMultiplier = payouts[matches] || 0;
    const payout = betAmount * payoutMultiplier;

    if (payout > 0) {
      user.wallet += payout;
    }
    await user.save();

    // Crear el embed del resultado
    const embed = new EmbedBuilder()
      .setColor(payout > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🎲 Keno Results 🎲')
      .setDescription(
        `**Your Numbers:** ${chosenNumbers.join(', ')}\n**Winning Numbers:** ${winningNumbers.join(', ')}\n**Matches:** ${matches}\n\n**${payout > 0 ? `You won ${payout} <:money:1305557747017973791>!` : `You lost ${betAmount} <:money:1305557747017973791>. Better luck next time!`}**`,
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