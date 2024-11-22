const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { User } = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('managemoney')
    .setDescription('Manage money for a user.')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Action to perform: add, remove, or reset')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'reset', value: 'reset' },
        ),
    )
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to manage money for')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription(
          'The amount of money to add or remove (not needed for reset)',
        )
        .setRequired(false),
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator,
      )
    ) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const action = interaction.options.getString('action');
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    let user = await User.findOne({ where: { userId: target.id } });

    if (!user) {
      user = await User.create({ userId: target.id, wallet: 0, bank: 0 });
    }

    if (action === 'add') {
      if (amount === null) {
        return interaction.reply({
          content: 'Please specify an amount to add.',
          ephemeral: true,
        });
      }
      user.wallet += amount;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('💸 Money Added')
        .setDescription(
          `Added **${amount} coins** to ${target.username}'s wallet.`,
        )
        .addFields(
          {
            name: 'New Wallet Balance',
            value: `${user.wallet} coins`,
            inline: true,
          },
          {
            name: 'New Bank Balance',
            value: `${user.bank} coins`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: interaction.member.displayName,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.reply({ embeds: [embed] });
    } else if (action === 'remove') {
      if (amount === null) {
        return interaction.reply({
          content: 'Please specify an amount to remove.',
          ephemeral: true,
        });
      }
      user.wallet = Math.max(user.wallet - amount, 0);
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('💸 Money Removed')
        .setDescription(
          `Removed **${amount} <:money:1305557747017973791>** from ${target.username}'s wallet.`,
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
    } else if (action === 'reset') {
      user.wallet = 0;
      user.bank = 0;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🔄 Money Reset')
        .setDescription(`Reset all money for ${target.username}.`)
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
    }
  },
};
