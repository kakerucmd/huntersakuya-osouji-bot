const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType } = require('discord.js');
const Keyv = require('keyv');

const joinleavelog = new Keyv('sqlite://db.sqlite', { table: 'joinleavelog' });
const msg_url_embed = new Keyv('sqlite://db.sqlite', { table: 'msgurlembed' });
const welcome = new Keyv('sqlite://db.sqlite', { table: 'welcome' });
const ticket = new Keyv('sqlite://db.sqlite', { table: 'ticket' });
const quickleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leavechannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });
const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const levelchannels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-settings')
        .setDescription('このサーバーでのbotの設定をすべて取得します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {

        const guildId = interaction.guild.id;

        const osouzireply_data = await osouzireply.get(guildId);
        const joinleavelog_data = await joinleavelog.get(guildId);
        const msg_url_embed_data = await msg_url_embed.get(guildId);
        const welcome_data = await welcome.get(guildId);
        const ticket_data = await ticket.get(guildId);
        const quickleave_data = await quickleave.get(guildId);
        const leavechannel_data = await leavechannel.get(guildId);
        const levelsettings_data = await levelsettings.get(guildId);
        const levelchannels_data = await levelchannels.get(guildId);


        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.guild.name}でのbotの設定`,
                iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
            })
            .setColor('Blurple')
            .addFields(
                { name: 'お掃除などの単語に対する自動返信', value: osouzireply_data ? '有効' : '無効' },
                { name: '入退室ログ', value: joinleavelog_data ? '有効' : '無効' },
                { name: 'メッセージ展開機能', value: msg_url_embed_data ? '有効' : '無効' },
                { name: 'ウェルカムメッセージ', value: welcome_data ? '有効' : '無効' },
                { name: 'チケット機能', value: ticket_data ? '有効' : '無効' },
                { name: '即抜けの通知', value: quickleave_data ? `有効(<#${leavechannel_data}>に通知を送信)` : '無効' },
                { name: 'レベル機能', value: levelsettings_data ? `有効(${levelchannels_data ? `<#${levelchannels_data}>に通知を送信` : '通知を送信しない'})` : '無効' },
            )
            .setTimestamp()

        await interaction.reply({ embeds: [embed] });
    },
};