const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('指定したユーザーをタイムアウトします')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
    .setDMPermission(false)
    .addUserOption(option => 
      option.setName('user')
        .setDescription('タイムアウトするユーザー')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('タイムアウトの期間（秒）')
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const guild = interaction.guild;
    const user = interaction.user;

    if (!member) {
      return await interaction.reply({ content: 'サーバー内に存在するユーザーのみタイムアウトできます。', ephemeral: true });
    }

    if (guild.ownerId !== user.id && member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
        try {
          return await interaction.reply({ content: 'あなたと同等以上の役職をもつメンバーをタイムアウトすることはできません', ephemeral: true });
        } catch (error) {
          console.error(error);
        }
      }

    try {
      await member.timeout(duration * 1000);
      try {
        await interaction.reply({ content: `<@${member.user.id}>を${duration}秒間タイムアウトしました。`, ephemeral: true });
      } catch (error) {
      }
    } catch (error) {
      console.error(error);
    }
  },
};