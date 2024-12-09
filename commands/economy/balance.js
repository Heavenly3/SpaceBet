const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Shows the current balance of a user.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to check the balance of'),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    let user = await User.findOne({ where: { userId: target.id } });

    if (!user) {
      user = await User.create({ userId: target.id, wallet: 0, bank: 0 });
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Balance')
      .setDescription(`Balance information for <@${target.id}>`)
      .addFields(
        {
          name: 'Galactic Wallet',
          value: `${user.wallet} <:disk:1309988409208475730>`,
          inline: true,
        },
        {
          name: 'Stellar Bank',
          value: `${user.bank} <:disk:1309988409208475730>`,
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
