const { SlashCommandBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('指定したユーザーをキックします')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('キックするユーザー')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('キックの理由')
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
            return await interaction.reply({ content: 'サーバー内に存在するユーザーのみキックできます。', flags: MessageFlags.Ephemeral });
        }

        if (guild.ownerId !== user.id && member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
            try {
                return await interaction.reply({ content: 'あなたと同等以上の役職をもつメンバーをキックすることはできません', flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        }
        if (!member.kickable) {
            try {
                return await interaction.reply({ content: 'botがこのユーザーをキックすることができません。権限を確認してください', flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        }

        try {
            await member.kick(reason);
            try {
                await interaction.reply({ content: `<@${member.user.id}>をキックしました。理由: ${reason}`, flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    },
};