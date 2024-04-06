const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const Keyv = require('keyv');

const setinappdel = new Keyv('sqlite://db.sqlite', { table: 'setinappdel' });
const badwords = new Keyv('sqlite://db.sqlite', { table: 'badwords' });
const notifychannel = new Keyv('sqlite://db.sqlite', { table: 'notifychannel' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setinappdel')
        .setDescription('不適切な発言の自動削除機能を有効にするか設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addBooleanOption(option => 
            option.setName('enable')
                .setDescription('有効または無効にします')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('words')
                .setDescription('削除する単語のリスト（カンマ区切り）')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('通知を送信するチャンネル')
                .setRequired(true)),
        async execute(interaction) {

        const enable = interaction.options.getBoolean('enable');
        await setinappdel.set(interaction.guild.id, enable);

        const words = interaction.options.getString('words');
        if (words) {
            await badwords.set(interaction.guild.id, words.split(','));
        }

        const channel = interaction.options.getChannel('channel');
        if (channel) {
            await notifychannel.set(interaction.guild.id, channel.id);
        }

        return interaction.reply({ content: `不適切な発言の自動削除機能が${enable ? '有効化' : '無効化'}されました。`, ephemeral: true });
    },
};