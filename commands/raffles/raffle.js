const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Raffle } = require('../../models/Raffle');
const { User } = require('../../models/User');
const { RafflePool } = require('../../models/RafflePool');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raffle')
    .setDescription('Buy a raffle ticket with a three-digit number')
    .addIntegerOption((option) =>
      option
        .setName('number')
        .setDescription('Three-digit number for the raffle (000-999)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(999),
    ),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({
        content: 'You must have an account to buy a raffle ticket.',
        ephemeral: true,
      });
    }

    const raffleNumber = interaction.options.getInteger('number');
    const ticketPrice = 100;
    const initialPrize = 500;

    if (user.wallet < ticketPrice) {
      return interaction.reply({
        content: 'You do not have enough money to buy a ticket.',
        ephemeral: true,
      });
    }

    let prizePool = await RafflePool.findOne();
    if (!prizePool) {
      prizePool = await RafflePool.create({ prize: initialPrize });
    }

    let raffle = await Raffle.findOne({
      where: { userId: interaction.user.id, number: raffleNumber },
    });
    if (raffle) {
      return interaction.reply({
        content: 'You have already bought a ticket with this number.',
        ephemeral: true,
      });
    } else {
      raffle = await Raffle.create({
        userId: interaction.user.id,
        number: raffleNumber,
        ticketPrice: ticketPrice,
        drawDate: new Date(Date.now() + 30000),
      });
    }

    user.wallet -= ticketPrice;
    prizePool.prize += ticketPrice;
    await user.save();
    await prizePool.save();

    await interaction.reply({
      content: `You bought the number **${raffleNumber}** for the raffle. The draw will take place in 30 seconds.`,
    });

    setTimeout(async () => {
      const winningNumber = Math.floor(Math.random() * 1000);
      const winner = await Raffle.findOne({ where: { number: winningNumber } });

      const embed = new EmbedBuilder()
        .setTitle('🎉 Raffle Result 🎉')
        .setDescription(`Winning number: **${winningNumber}**`)
        .setColor(winner ? 0x00ff00 : 0xff0000)
        .setTimestamp();

      if (winner) {
        const winningUser = await User.findOne({
          where: { userId: winner.userId },
        });
        winningUser.wallet += prizePool.prize;
        await winningUser.save();

        embed.addFields(
          { name: 'Winner', value: `<@${winner.userId}>` },
          { name: 'Total Prize', value: `${prizePool.prize} Lobe Coin` },
        );

        prizePool.prize = initialPrize;
        await prizePool.save();
      } else {
        embed.setDescription(
          `Winning number: **${winningNumber}**\nThere were no winners this time. The prize pool continues to grow.`,
        );
      }

      await interaction.followUp({ embeds: [embed] });

      await Raffle.destroy({ where: {} });
    }, 30000);
  },
};
