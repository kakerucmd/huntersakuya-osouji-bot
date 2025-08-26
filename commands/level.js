const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, PermissionsBitField, InteractionContextType, ChannelType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('レベル機能の管理')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName('setup').setDescription('レベル機能をセットアップします'))
        .addSubcommand(command => command.setName('config').setDescription('レベル機能の追加設定を行います'))
        .addSubcommand(command => command.setName('disable').setDescription('レベル機能の設定を削除し、無効にします。レベルは削除されません。')),

    async execute(interaction) {
        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await settings.get(interaction.guild.id);

        function getConfigSelectMenu() {
            return new StringSelectMenuBuilder()
                .setCustomId('levelConfigSelect')
                .setPlaceholder('設定したい項目を選んでください')
                .addOptions([
                    {
                        label: '🔔 通知オン/オフ切り替え',
                        description: '通知の有効/無効を切り替えます',
                        value: 'toggle_notification',
                    },
                    {
                        label: '📝 メッセージを再設定する',
                        description: 'レベルアップ時のメッセージを変更します',
                        value: 'edit_message',
                    },
                    {
                        label: '🚫 レベル機能を無効化',
                        description: 'レベル機能を無効化します（設定削除）',
                        value: 'disable_level',
                    },
                ]);
        }

        switch (sub) {
            case 'setup':
                if (data) {
                    await interaction.reply({
                        content: '既にセットアップされています。変更したい場合は、以下のオプションから選んでください。',
                        components: [new ActionRowBuilder().addComponents(getConfigSelectMenu())],
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    const channelsList = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
                    const options = channelsList.map(channel => ({
                        label: channel.name,
                        value: channel.id,
                    }));

                    options.push({
                        label: '通知しない',
                        value: 'none',
                    });

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('levelNotificationSelect')
                        .setPlaceholder('通知を送るチャンネルを選んでください')
                        .addOptions(options);

                    const row = new ActionRowBuilder().addComponents(selectMenu);

                    await interaction.reply({
                        content: '通知するチャンネルを選択してください。',
                        components: [row],
                        flags: MessageFlags.Ephemeral,
                    });
                }
                break;

            case 'disable':
                if (!data) {
                    await interaction.reply({
                        content: 'レベル機能が有効化されていません。',
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await settings.delete(interaction.guild.id);
                    await messages.delete(interaction.guild.id);
                    await channels.delete(interaction.guild.id);
                    await interaction.reply({
                        content: 'レベル機能の設定を削除し、無効にしました。',
                        flags: MessageFlags.Ephemeral,
                    });
                }
                break;

            case 'config':
                if (!data) {
                    await interaction.reply({
                        content: 'レベル機能がまだ有効化されていません。まず `/level setup` を行ってください。',
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    const select = getConfigSelectMenu();
                    const row = new ActionRowBuilder().addComponents(select);

                    await interaction.reply({
                        content: '設定したい項目を選んでください。',
                        components: [row],
                        flags: MessageFlags.Ephemeral,
                    });
                }
                break;
        }
    }
};