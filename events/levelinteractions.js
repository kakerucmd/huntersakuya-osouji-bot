const { Events, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        try {
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'levelNotificationSelect') {
                    const selected = interaction.values[0];

                    if (selected === 'none') {
                        await channels.set(interaction.guild.id, null);
                        await settings.set(interaction.guild.id, true);

                        const embed = new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('✅ レベル機能のセットアップが完了しました！')
                            .setDescription(`通知は行いません。`);

                        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                        return;
                    }

                    if (selected === 'custom_id_input') {
                        const modal = new ModalBuilder()
                            .setCustomId('levelChannelIdModal')
                            .setTitle('チャンネルIDを指定');

                        const channelIdInput = new TextInputBuilder()
                            .setCustomId('channel_id')
                            .setLabel('通知を送るチャンネルのIDを入力してください')
                            .setPlaceholder('開発者モードを有効にすると、コンテキストメニューからコピーできます')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        modal.addComponents(new ActionRowBuilder().addComponents(channelIdInput));
                        await interaction.showModal(modal);
                        return;
                    }

                    await channels.set(interaction.guild.id, selected);
                    const modal = new ModalBuilder()
                        .setCustomId('levelSetupModal')
                        .setTitle('通知メッセージ');

                    const messageInput = new TextInputBuilder()
                        .setCustomId('message')
                        .setLabel('レベルアップ時の通知メッセージを入力してください（任意）')
                        .setPlaceholder('例: {user}さんのレベルが{level}になりました！')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false);

                    const firstRow = new ActionRowBuilder().addComponents(messageInput);
                    modal.addComponents(firstRow);

                    await interaction.showModal(modal);
                    return;
                }

                if (interaction.customId === 'levelConfigSelect') {
                    const selected = interaction.values[0];

                    if (selected === 'toggle_notification') {
                        const currentChannel = await channels.get(interaction.guild.id);

                        if (currentChannel) {
                            await channels.delete(interaction.guild.id);
                            await interaction.update({ content: '通知を無効化しました。', components: [] });
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

                            await interaction.update({
                                content: '通知を有効化しました。通知するチャンネルを選んでください。',
                                components: [row],
                            });
                        }
                    }

                    if (selected === 'edit_message') {
                        const modal = new ModalBuilder()
                            .setCustomId('levelMessageEditModal')
                            .setTitle('レベルアップ時の通知メッセージを変更');

                        const messageInput = new TextInputBuilder()
                            .setCustomId('message')
                            .setLabel('新しい通知メッセージを入力してください（空欄にするとデフォルトに戻ります）')
                            .setPlaceholder('例: {user}さんのレベルが{level}になりました！')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(false);

                        const firstRow = new ActionRowBuilder().addComponents(messageInput);
                        modal.addComponents(firstRow);

                        await interaction.showModal(modal);
                        return;
                    }

                    if (selected === 'disable_level') {
                        await settings.delete(interaction.guild.id);
                        await messages.delete(interaction.guild.id);
                        await channels.delete(interaction.guild.id);
                        await interaction.update({ content: 'レベル機能が無効化されました。', components: [] });
                    }
                }
            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'levelSetupModal') {
                    const message = interaction.fields.getTextInputValue('message');

                    if (message.trim() === '') {
                        await messages.delete(interaction.guild.id);
                    } else {
                        await messages.set(interaction.guild.id, message);
                    }

                    await settings.set(interaction.guild.id, true);

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('✅ レベル機能のセットアップが完了しました！')
                        .setDescription(`通知チャンネル: ${await channels.get(interaction.guild.id) ? `<#${await channels.get(interaction.guild.id)}>` : 'なし'}\nメッセージ: ${message.trim() ? message : 'デフォルトメッセージが使用されます。'}`);

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (interaction.customId === 'levelMessageEditModal') {
                    const newMessage = interaction.fields.getTextInputValue('message');

                    if (newMessage.trim() === '') {
                        await messages.delete(interaction.guild.id);
                    } else {
                        await messages.set(interaction.guild.id, newMessage);
                    }

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('✅ 通知するメッセージが変更されました')
                        .setDescription(`${newMessage.trim() ? newMessage : 'デフォルトメッセージが使用されます。'}`);

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (interaction.customId === 'levelChannelIdModal') {
                    const channelId = interaction.fields.getTextInputValue('channel_id').trim();
                    const channel = interaction.guild.channels.cache.get(channelId);

                    if (!channel || channel.type !== ChannelType.GuildText) {
                        await interaction.reply({ content: '無効なチャンネルIDです。', flags: MessageFlags.Ephemeral });
                        return;
                    }

                    await channels.set(interaction.guild.id, channelId);
                    await settings.set(interaction.guild.id, true);

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('✅ レベル機能のセットアップが完了しました！')
                        .setDescription(`通知チャンネル: <#${channelId}>`);

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    return;
                }
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
