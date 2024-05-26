const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Keyv = require('keyv');

const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('globalchat')
    .setDescription('グローバルチャットの管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false)
    .addSubcommand(command => command.setName('enable').setDescription('指定したチャンネルのグローバルチャットを有効にします').addChannelOption(option => option.setName('channel').setDescription('グローバルチャットにするチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('指定したチャンネルのグローバルチャットを無効にします').addChannelOption(option => option.setName('channel').setDescription('グローバルチャットを無効にするチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true))),

    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const channel = options.getChannel('channel');
        const channels = await globalchannels.get('globalchannels') || {};

        switch (sub) {
            case 'enable':
                await interaction.deferReply({ ephemeral: true });

                if (channels[channel.id]) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '⚠️｜エラー' })
                        .setDescription(`グローバルチャットは既に${channel}で有効化されています。`)
                        .setColor('#ff0000');
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                try {
                    const webhook = await channel.createWebhook({ name: "Global chat Webhook" });
                    channels[channel.id] = webhook.url;

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setDescription(`グローバルチャットが${channel}で有効化されました。\nスパム行為などはおやめください。`)
                        .setColor('#00ff00');
                    await interaction.editReply({ embeds: [embed] });

                    await channel.setRateLimitPerUser(5);
                } catch (error) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '❌｜エラー' })
                        .setDescription(`Webhookの作成中にエラーが発生しました。\nBotにWebhookを作成する権限があることを確認してください。`)
                        .setColor('#ff0000');
                    return interaction.editReply({ embeds: [embed] });
                }
                await globalchannels.set('globalchannels', channels);
                break;

                case 'disable':
                    await interaction.deferReply({ ephemeral: true });
                    if (!channels[channel.id]) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: '⚠️｜エラー' })
                            .setDescription(`グローバルチャットが${channel}で有効化されていません。`)
                            .setColor('#ff0000');
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
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: '⚠️｜成功' })
                            .setDescription(`グローバルチャットの無効化に成功しましたが、グローバルチャット用Webhookの削除に失敗しました。\nグローバルチャット用Webhookは手動で削除を行ってください。`)
                            .setColor('#ff0000');
                        return interaction.editReply({ embeds: [embed] });
                    }
                
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setDescription(`グローバルチャットが${channel}で無効化されました。`)
                        .setColor('#00ff00');
                    await interaction.editReply({ embeds: [embed] });
                    await channel.setRateLimitPerUser(0);                
        }
    }
};
