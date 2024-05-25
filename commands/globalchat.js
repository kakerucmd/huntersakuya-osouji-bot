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

        const  { options } = interaction;
        const sub = options.getSubcommand();

        const channel = options.getChannel('channel');
        const channels = await globalchannels.get('globalchannels') || {};

        switch (sub) {
            case 'enable':
                await interaction.deferReply({ ephemeral: true });
                try {
                    const webhook = await channel.createWebhook({ name: "Global chat Webhook" });
                    channels[channel.id] = webhook.url;

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setDescription(`グローバルチャットが${channel}で有効化されました。\nスパム行為などはおやめください。`)
                        .setColor('#00ff00');
                    await interaction.editReply({ embeds: [embed], ephemeral: true });

                    await channel.setRateLimitPerUser(5);
                } catch (error) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '❌｜エラー' })
                        .setDescription(`Webhookの作成中にエラーが発生しました。BotにWebhookを作成する権限があることを確認してください。`)
                        .setColor('#ff0000');
                    return interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                await globalchannels.set('globalchannels', channels);
                break;

            case 'disable':
                await interaction.deferReply({ ephemeral: true });
                if (!channels[channel.id]) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: '❌｜エラー' })
                        .setDescription(`グローバルチャットが${channel}で有効化されていません。`)
                        .setColor('#ff0000');
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }

                delete channels[channel.id];
                const embed = new EmbedBuilder()
                    .setAuthor({ name: '✅｜成功' })
                    .setDescription(`グローバルチャットが${channel}で無効化されました。\n${channel}のグローバルチャット用Webhookは削除して大丈夫です。`)
                    .setColor('#00ff00');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                await channel.setRateLimitPerUser(0);

                await globalchannels.set('globalchannels', channels);
        }
    }
};
