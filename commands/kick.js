const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('指定したユーザーをKickします')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .setDMPermission(false)
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Kickするユーザー')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Kickの理由')
        .setRequired(false)),
  async execute(interaction) {
    const guild = interaction.guild;
    const member = interaction.options.getMember('user');
    const user = interaction.user;
    let reason = interaction.options.getString('reason');

    if (!reason) {
      reason = '理由は指定されていません';
    }

    if (!member) {
      return await interaction.reply({ content: 'サーバー内に存在するユーザーのみKickできます。', ephemeral: true });
    }

    if (guild.ownerId !== user.id && member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
      try {
        return await interaction.reply({ content: 'あなたと同等以上の役職をもつメンバーをKickすることはできません', ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    }
    if (!member.kickable) {
      try {
        return await interaction.reply({ content: 'botがこのユーザーをKickすることができません。権限を確認してください', ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    }

    try {
      await member.kick(reason);
      try {
        await interaction.reply({ content: `<@${member.user.id}>をKickしました。理由: ${reason}`, ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  },
};