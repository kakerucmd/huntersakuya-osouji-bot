const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('指定したユーザーをタイムアウトします')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option.setName('user').setDescription('タイムアウトするユーザー').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('タイムアウトする時間').setRequired(true).addChoices(
            { name: `60秒`, value: `60` },
            { name: `2分`, value: `120` },
            { name: `5分`, value: `300` },
            { name: `10分`, value: `600` },
            { name: `15分`, value: `900` },
            { name: `20分`, value: `1200` },
            { name: `30分`, value: `1800` },
            { name: `45分`, value: `2700` },
            { name: `1時間`, value: `3600` },
            { name: `2時間`, value: `7200` },
            { name: `3時間`, value: `10000` },
            { name: `5時間`, value: `18000` },
            { name: `10時間`, value: `36000` },
            { name: `1日`, value: `86400` },
            { name: `2日`, value: `172800` },
            { name: `3日`, value: `259200` },
            { name: `5日`, value: `432000` },
            { name: `1週間`, value: `604800` },
        ))
        .addStringOption(option => option.setName('reason').setDescription('タイムアウトする理由').setRequired(false)),
    async execute(interaction) {
        try {
            const timeUser = interaction.options.getUser('user');
            const timeMember = await interaction.guild.members.fetch(timeUser.id);
            const duration = interaction.options.getString('duration');
            const reason = interaction.options.getString('reason') || '理由は指定されていません';

            if (!timeMember) return await interaction.reply({ content: `ユーザーが${interaction.guild.name}に存在しません。`, flags: MessageFlags.Ephemeral })
            if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: '管理者権限を持つユーザーはタイムアウトできません。', flags: MessageFlags.Ephemeral });

            if (interaction.guild.ownerId !== interaction.user.id && timeMember.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
                return await interaction.reply({ content: 'あなたと同等以上の役職を持つメンバーをタイムアウトすることはできません。', flags: MessageFlags.Ephemeral });
            }
            await timeMember.timeout(duration * 1000, reason);

            const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜操作に成功' })
                .setColor('#00ff00')
                .setDescription(`<@${timeMember.id}>をタイムアウトしました`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    }
};