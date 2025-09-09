const { SlashCommandBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('指定したユーザーをBANします')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('BANするユーザー')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('BANの理由')
                .setRequired(false)),
    async execute(interaction) {
        const guild = interaction.guild;
        const member = interaction.options.getMember('user');
        const user = interaction.user;
        let reason = interaction.options.getString('reason');

        if (!member) {
            return await interaction.reply({ content: 'サーバー内に存在するユーザーのみBANできます。', flags: MessageFlags.Ephemeral });
        }

        if (!reason) {
            reason = '理由は指定されていません';
        }

        if (guild.ownerId !== user.id && member.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
            try {
                return await interaction.reply({ content: 'あなたと同等以上の役職をもつメンバーをBANすることはできません', flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        }
        if (!member.bannable) {
            try {
                return await interaction.reply({ content: 'botがこのユーザーをBANすることができません。権限を確認してください', flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        }

        try {
            await member.ban({ reason: `${reason}` });
            try {
                await interaction.reply({ content: `<@${member.user.id}>をBANしました。理由: ${reason}`, flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    },
};