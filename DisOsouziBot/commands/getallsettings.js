const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Keyv = require('keyv');

const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leaveChannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });
const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getallsettings')
        .setDescription('このサーバーの設定をすべて取得します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false),
    async execute(interaction) {

        const guildId = interaction.guild.id;

        const toggleleaveValue = await toggleleave.get(guildId);
        const leaveChannelValue = await leaveChannel.get(guildId);
        const osouzireplyValue = await osouzireply.get(guildId);
        const levelsettingsValue = await levelsettings.get(guildId);
        const channelsValue = await channels.get(guildId);

        const server_settings_embed = new EmbedBuilder()
            .setTitle('Server Settings')
            .setColor('#0099ff')
            .addFields(
                { name: 'お掃除などの単語に対する自動返信', value: osouzireplyValue ? '有効' : '無効' },
                { name: 'レベル機能', value: levelsettingsValue ? `有効、<#${channelsValue}>に通知を送信` : '無効' },
                { name: '即抜けの通知', value: toggleleaveValue ? `有効、<#${leaveChannelValue}>に通知を送信` : '無効' }
            );

        await interaction.reply({ embeds: [server_settings_embed] });
    },
};
