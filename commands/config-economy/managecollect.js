const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require('discord.js');
const { RoleCollect } = require('../../models/RoleCollect');
const { Settings } = require('../../models/Settings');

async function getRolesWithCollect() {
  const roles = await RoleCollect.findAll();
  return roles.map((role) => ({
    name: role.roleId,
    value: role.roleId,
  }));
}

function parseCooldown(cooldown) {
  const match = cooldown.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return null;
  }
}

function formatCooldown(cooldownSeconds) {
  if (cooldownSeconds < 60) {
    return `${cooldownSeconds} seconds`;
  } else if (cooldownSeconds < 3600) {
    return `${Math.floor(cooldownSeconds / 60)} minutes`;
  } else if (cooldownSeconds < 86400) {
    return `${Math.floor(cooldownSeconds / 3600)} hours`;
  } else {
    return `${Math.floor(cooldownSeconds / 86400)} days`;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('managecollect')
    .setDescription('Manage collect amounts for roles (admin only)')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription(
          'The action to perform: add, modify, remove, list, or set_cooldown',
        )
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Modify', value: 'modify' },
          { name: 'Remove', value: 'remove' },
          { name: 'List', value: 'list' },
          { name: 'Set Cooldown', value: 'set_cooldown' },
        ),
    )
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to manage')
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The collect amount (required for add/modify)')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('cooldown')
        .setDescription(
          'Cooldown time in the format [num][smhd] (e.g., 1h for 1 hour)',
        )
        .setRequired(false),
    ),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    if (
      focusedOption.name === 'role' &&
      interaction.options.getString('action') === 'remove'
    ) {
      const roles = await getRolesWithCollect();
      await interaction.respond(
        roles.filter((role) =>
          role.name.toLowerCase().includes(focusedOption.value.toLowerCase()),
        ),
      );
    }
  },

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
    const role = interaction.options.getRole('role');
    const amount = interaction.options.getInteger('amount');
    const cooldown = interaction.options.getString('cooldown');

    if (action === 'add') {
      if (amount === null) {
        return interaction.reply({
          content: 'You must provide an amount to add.',
          ephemeral: true,
        });
      }
      await RoleCollect.upsert({ roleId: role.id, amount });
      return interaction.reply(
        `The collect amount for role **${role.name}** has been added and set to **${amount} <:disk:1309988409208475730>**.`,
      );
    }

    if (action === 'modify') {
      if (amount === null) {
        return interaction.reply({
          content: 'You must provide an amount to modify.',
          ephemeral: true,
        });
      }

      const roleCollect = await RoleCollect.findOne({
        where: { roleId: role.id },
      });

      if (!roleCollect) {
        return interaction.reply(
          `The role **${role.name}** does not have a collect amount set. Use the \`add\` action first.`,
        );
      }

      roleCollect.amount = amount;
      await roleCollect.save();
      return interaction.reply(
        `The collect amount for role **${role.name}** has been modified to **${amount} <:disk:1309988409208475730>**.`,
      );
    }

    if (action === 'remove') {
      if (role === null && interaction.options.getString('role') === 'all') {
        await RoleCollect.destroy({ where: {} });
        return interaction.reply(
          'All collect amounts for all roles have been removed.',
        );
      }

      const roleCollect = await RoleCollect.findOne({
        where: { roleId: role.id },
      });

      if (!roleCollect) {
        return interaction.reply(
          `The role **${role.name}** does not have a collect amount set.`,
        );
      }

      await RoleCollect.destroy({ where: { roleId: role.id } });
      return interaction.reply(
        `The collect amount for role **${role.name}** has been removed.`,
      );
    }

    if (action === 'list') {
      const rolesWithRewards = await RoleCollect.findAll();
      const cooldownSetting = await Settings.findOne({
        where: { key: 'collectCooldown' },
      });
      const cooldownTime = cooldownSetting
        ? parseInt(cooldownSetting.value)
        : 30;

      if (rolesWithRewards.length === 0) {
        return interaction.reply({
          content: 'There are no roles with collect rewards set.',
          ephemeral: true,
        });
      }

      let rewardsList = '';

      for (let roleReward of rolesWithRewards) {
        const role = interaction.guild.roles.cache.get(roleReward.roleId);
        if (role) {
          rewardsList += `<@&${role.id}> - **${roleReward.amount} <:disk:1309988409208475730>**\n`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Roles with Collect Rewards')
        .setDescription(rewardsList)
        .addFields({
          name: 'Collect Cooldown',
          value: formatCooldown(cooldownTime),
          inline: false,
        })
        .setTimestamp()
        .setFooter({
          text: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      return interaction.reply({ embeds: [embed] });
    }

    if (action === 'set_cooldown') {
      if (cooldown === null) {
        return interaction.reply({
          content:
            'You must provide a cooldown time in the format [num][smhd] (e.g., 1h for 1 hour).',
          ephemeral: true,
        });
      }

      const cooldownTime = parseCooldown(cooldown);
      if (cooldownTime === null) {
        return interaction.reply({
          content:
            'Invalid cooldown format. Please use [num][smhd] (e.g., 1h for 1 hour).',
          ephemeral: true,
        });
      }

      await Settings.upsert({
        key: 'collectCooldown',
        value: cooldownTime.toString(),
      });

      return interaction.reply(
        `The cooldown time has been set to **${formatCooldown(cooldownTime)}**.`,
      );
    }

    return interaction.reply({
      content:
        'Invalid action specified. Please choose add, modify, remove, list, or set_cooldown.',
      ephemeral: true,
    });
  },
};
