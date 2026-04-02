const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, PermissionsBitField, InteractionContextType, ChannelType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });
const groups = new Keyv('sqlite://db.sqlite', { table: 'levelgroups' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('レベル機能の管理')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName('setup').setDescription('レベル機能をセットアップします'))
        .addSubcommand(command => command.setName('config').setDescription('レベル機能の追加設定を行います'))
        .addSubcommand(command =>
            command
                .setName('link_accounts')
                .setDescription('ランキング上でメインアカウントとサブアカウントの経験値をまとめます')
                .addStringOption(option =>
                    option.setName('name').setDescription('ユーザ名').setRequired(true)
                )
                .addUserOption(option =>
                    option.setName('user1').setDescription('1人目').setRequired(true)
                )
                .addUserOption(option =>
                    option.setName('user2').setDescription('2人目').setRequired(true)
                )
        )
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

                    const channelOptions = [...channelsList.values()]
                        .slice(0, 23)
                        .map(ch => ({
                            label: ch.name.slice(0, 90),
                            value: ch.id,
                        }));

                    channelOptions.push(
                        { label: '📩 その他のチャンネルを指定（ID入力）', value: 'custom_id_input' },
                        { label: '通知しない', value: 'none' }
                    );

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('levelNotificationSelect')
                        .setPlaceholder('通知を送るチャンネルを選んでください')
                        .addOptions(channelOptions);

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
        return;
    }

    await settings.delete(interaction.guild.id);
    await messages.delete(interaction.guild.id);
    await channels.delete(interaction.guild.id);

    // グループの削除
    const entries = groups.iterator();
    for await (const [key, value] of entries) {
        if (value.guildId === interaction.guild.id) {
            await groups.delete(key);
        }
    }

    await interaction.reply({
        content: 'レベル機能の設定を削除し、無効にしました。サブアカウントとのリンクも解除済みです。',
        flags: MessageFlags.Ephemeral,
    });
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

            case 'link_accounts': {
                const name = options.getString('name');
                const user1 = options.getUser('user1');
                const user2 = options.getUser('user2');

                if (user1.bot || user2.bot) {
                    return interaction.reply({
                        content: 'Botは指定できません。',
                        flags: MessageFlags.Ephemeral,
                    });
                }

                if (user1.id === user2.id) {
                    return interaction.reply({
                        content: '同じユーザーは指定できません。',
                        flags: MessageFlags.Ephemeral,
                    });
                }

                const entries = groups.iterator();

                for await (const [, data] of entries) {
                    if (data.guildId !== interaction.guild.id) continue;

                    if (
                        data.users.includes(user1.id) ||
                        data.users.includes(user2.id)
                    ) {
                        return interaction.reply({
                            content: 'どちらかのユーザーは既にリンクされています。',
                            flags: MessageFlags.Ephemeral,
                        });
                    }
                }

                const groupId = `${Date.now()}_${Math.random()}`;

                await groups.set(groupId, {
                    guildId: interaction.guild.id,
                    name: name,
                    users: [user1.id, user2.id],
                });

                return interaction.reply({
                    content: `「${name}」として<@${user1.id}>と<@${user2.id}>をリンクしました。`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
};