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
      .setTitle('<:balance:1305558738240933928> Balance')
      .setDescription(`Balance information for ${target.username}`)
      .addFields(
        {
          name: '<:wallet:1305557719528243353> Wallet',
          value: `${user.wallet} <:money:1305557747017973791>`,
          inline: true,
        },
        {
          name: '<:safe:1305557666319306782> Bank',
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
