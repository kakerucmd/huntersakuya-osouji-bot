const { SlashCommandBuilder, PermissionsBitField, ChannelType, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../functions/createembed');

const Keyv = require('keyv');
const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('globalchat')
    .setDescription('グローバルチャットの管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(command => command.setName('enable').setDescription('指定したチャンネルのグローバルチャットを有効にします').addChannelOption(option => option.setName('channel').setDescription('グローバルチャットにするチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('指定したチャンネルのグローバルチャットを無効にします').addChannelOption(option => option.setName('channel').setDescription('グローバルチャットを無効にするチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true))),

    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const channel = options.getChannel('channel');
        const channels = await globalchannels.get('globalchannels') || {};

        switch (sub) {
            case 'enable':
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                if (channels[channel.id]) {
                    const embed = createEmbed('⚠️｜エラー', '#ff0000', `グローバルチャットは既に${channel}で有効化されています。`);
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                try {
                    const webhook = await channel.createWebhook({ name: "Global chat Webhook" });
                    channels[channel.id] = webhook.url;

                    const embed = createEmbed('✅｜成功', '#00ff00', `グローバルチャットが${channel}で有効化されました。\nスパム行為などはおやめください。`);
                    await interaction.editReply({ embeds: [embed] });

                    await channel.setRateLimitPerUser(5);
                } catch (error) {
                    const embed = createEmbed('❌｜エラー', '#ff0000', `Webhookの作成中にエラーが発生しました。\nBotにWebhookを作成する権限があることを確認してください。`);
                    return interaction.editReply({ embeds: [embed] });
                }
                await globalchannels.set('globalchannels', channels);
                break;

                case 'disable':
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    if (!channels[channel.id]) {
                        const embed = createEmbed('⚠️｜エラー', '#ff0000', `グローバルチャットが${channel}で有効化されていません。`);
                        await interaction.editReply({ embeds: [embed] });
                        return;
                    }
                
                    const webhookURL = channels[channel.id];
                    delete channels[channel.id];
                    await globalchannels.set('globalchannels', channels);
                
                    try {
                        const webhooks = await channel.fetchWebhooks();
                        for (const webhook of webhooks.values()) {
                            if (webhook.url === webhookURL) {
                                await webhook.delete();
                            }
                        }
                    } catch (error) {
                        const embed = createEmbed('⚠️｜成功', '#ff0000', `グローバルチャットの無効化に成功しましたが、グローバルチャット用Webhookの削除に失敗しました。\nグローバルチャット用Webhookは手動で削除を行ってください。`);
                        return interaction.editReply({ embeds: [embed] });
                    }
                
                    const embed = createEmbed('✅｜成功', '#00ff00', `グローバルチャットが${channel}で無効化されました。`);
                    await interaction.editReply({ embeds: [embed] });
                    await channel.setRateLimitPerUser(0);                
        }
    }
};