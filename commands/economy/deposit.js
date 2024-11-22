const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit money into the bank.')
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription(
          'The amount to deposit or type "all" to deposit everything',
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    const amountInput = interaction.options.getString('amount');
    let amount;
    let user = await User.findOne({ where: { userId: interaction.user.id } });

    if (!user) {
      user = await User.create({
        userId: interaction.user.id,
        wallet: 0,
        bank: 0,
      });
    }

    if (amountInput.toLowerCase() === 'all') {
      amount = user.wallet;
    } else {
      amount = parseInt(amountInput);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          content: 'Please enter a valid amount or "all".',
          ephemeral: true,
        });
      }
    }

    if (amount > user.wallet) {
      return interaction.reply({
        content: `You don't have enough money in your wallet to deposit ${amount} coins.`,
        ephemeral: true,
      });
    }

    user.wallet -= amount;
    user.bank += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(0x0000ff)
      .setTitle('<:safe:1305557666319306782> Deposit Successful')
      .setDescription(
        `You have deposited **${amount} <:money:1305557747017973791>** into your bank.`,
      )
      .addFields(
        {
          name: 'New Wallet Balance',
          value: `${user.wallet} <:money:1305557747017973791>`,
          inline: true,
        },
        {
          name: 'New Bank Balance',
          value: `${user.bank} <:money:1305557747017973791>`,
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
