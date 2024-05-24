const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('指定したユーザーをBanします')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .setDMPermission(false)
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Banするユーザー')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Banの理由')
        .setRequired(false)),
  async execute(interaction) {
    const guild = interaction.guild;
    const member = interaction.options.getMember('user');
    const user = interaction.user;
    let reason = interaction.options.getString('reason');

    if (!member) {
      return await interaction.reply({ content: 'サーバー内に存在するユーザーのみBanできます。', ephemeral: true });
    }

    if (!reason) {
      reason = '理由は指定されていません';
    }

    if (guild.ownerId !== user.id && member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
      try {
        return await interaction.reply({ content: 'あなたと同等以上の役職をもつメンバーをBanすることはできません', ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    }
    if (!member.bannable) {
      try {
        return await interaction.reply({ content: 'botがこのユーザーをBanすることができません。権限を確認してください', ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    }

    try {
      await member.ban({ reason: `${reason} ` });
      try {
        await interaction.reply({ content: `<@${member.user.id}>をBanしました。理由: ${reason}`, ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  },
};