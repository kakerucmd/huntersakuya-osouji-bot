const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Keyv = require('keyv');

const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setglobalchat')
        .setDescription('指定したチャンネルでのグローバルチャットを有効化/無効化します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('グローバルチャットを有効にするか無効にするか')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('有効化/無効化するチャンネル')
                .setRequired(true)),
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const enable = interaction.options.getBoolean('enable');

        // チャンネルIDとWebhook URLをKeyvに保存します
        const channels = await globalchannels.get('globalchannels') || {};

        if (enable) {
            try {
                // Webhookを作成
                const webhook = await channel.createWebhook({name: "Global chat Webhook"});
                channels[channel.id] = webhook.url;
                const embed = new EmbedBuilder()
                     .setAuthor({ name: '✅｜操作に成功' })
                     .setDescription(`グローバルチャットが${channel}で有効化されました。\nスパム行為などはおやめください。`)
                     .setColor('#00ff00');
                await interaction.editReply({ embeds: [embed], ephemeral: true });

                // 低速モードを設定
                await channel.setRateLimitPerUser(5)
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: '❌｜エラー' })
                    .setDescription(`Webhookの作成中にエラーが発生しました。BotにWebhookを作成する権限があることを確認してください。`)
                    .setColor('#ff0000');
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        } else {
            delete channels[channel.id];
            const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜操作に成功' })
                .setDescription(`グローバルチャットが${channel}で無効化されました。\n${channel}のグローバルチャット用Webhookは削除して大丈夫です。`)
                .setColor('#00ff00');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            // 低速モードを解除
            await channel.setRateLimitPerUser(0);
        }

        await globalchannels.set('globalchannels', channels);
    },
};