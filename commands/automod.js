const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Automodルールを設定します')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(command => command.setName('flagged-words').setDescription('フラッグされることの多い単語をブロック'))
        .addSubcommand(command => command.setName('spam-messages').setDescription('スパムの疑いのあるメッセージをブロック'))
        .addSubcommand(command => command.setName('mention-spam').setDescription('指定した数以上のメンションを含むメッセージをブロックする').addIntegerOption(option => option.setName('number').setDescription('The number of mentions required to block a message').setRequired(true)))
        .addSubcommand(command => command.setName('keyword').setDescription('指定の単語を含むメッセージをブロックする').addStringOption(option => option.setName('word').setDescription('the word you want block').setRequired(true))),
    async execute(interaction) {
        const { guild, options } = interaction;
        const sub = options.getSubcommand();

        const existingRules = await guild.autoModerationRules.fetch();
        let ruleExists = false;

        switch (sub) {
            case 'flagged-words':
                ruleExists = existingRules.some(rule => rule.triggerType === 4 && rule.triggerMetadata.presets.includes(1));
                if (ruleExists) {
                    return interaction.reply({ content: '既に同じAutomodルールが存在します。', flags: MessageFlags.Ephemeral });
                }

                await interaction.reply({ content: `Loading your automod rule...` });

                const rule1 = await guild.autoModerationRules.create({
                    name: `フラッグされることの多い語句をブロック`,
                    creatorid: 'your-application-id-goes-here',
                    enabled: true,
                    eventType: 1,
                    triggerType: 4,
                    triggerMetadata: {
                        presets: [1, 2, 3]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'このメッセージはお掃除上方修正しろbotによってブロックされました。'
                            }
                        }
                    ]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply({ content: 'エラーが発生しました。' });
                    }, 2000);
                });

                setTimeout(async () => {
                    if (!rule1) return;

                    const embed1 = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setColor("#3498db")
                        .setDescription(`Automodルールが作成されました。\nフラッグされることの多い語句はブロックされます。`);

                    await interaction.editReply({ embeds: [embed1] });
                }, 3000);

                break;

            case 'keyword':
                const word = options.getString('word');
                ruleExists = existingRules.some(rule => rule.triggerType === 1 && rule.triggerMetadata.keywordFilter.includes(word));
                if (ruleExists) {
                    return interaction.reply({ content: '既にこのAutomodルールは設定済みです。', flags: MessageFlags.Ephemeral });
                }

                await interaction.reply({ content: `Loading your automod rule...` });

                const rule2 = await guild.autoModerationRules.create({
                    name: `${word}を含むメッセージをブロック`,
                    creatorid: 'your-application-id-goes-here',
                    enabled: true,
                    eventType: 1,
                    triggerType: 1,
                    triggerMetadata: {
                        keywordFilter: [word]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'このメッセージはお掃除上方修正しろbotによってブロックされました。'
                            }
                        }
                    ]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply({ content: 'AutoModルールの作成に失敗しました。' });
                    }, 2000);
                });

                setTimeout(async () => {
                    if (!rule2) return;

                    const embed2 = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setColor("#3498db")
                        .setDescription(`Automodルールが作成されました。\n"${word}"を含むメッセージはすべてブロックされます。`);

                    await interaction.editReply({ embeds: [embed2] });
                }, 3000);

                break;

            case 'spam-messages':
                ruleExists = existingRules.some(rule => rule.triggerType === 3);
                if (ruleExists) {
                    return interaction.reply({ content: '既にこのAutomodルールは設定済みです。', flags: MessageFlags.Ephemeral });
                }

                await interaction.reply({ content: `Loading your automod rule...` });

                const rule3 = await guild.autoModerationRules.create({
                    name: `スパム疑惑のあるコンテンツをブロック`,
                    creatorid: 'your-application-id-goes-here',
                    enabled: true,
                    eventType: 1,
                    triggerType: 3,
                    triggerMetadata: {},
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'このメッセージはお掃除上方修正しろbotによってブロックされました。'
                            }
                        }
                    ]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply({ content: 'エラーが発生しました。' });
                    }, 2000);
                });

                setTimeout(async () => {
                    if (!rule3) return;

                    const embed3 = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setColor("#3498db")
                        .setDescription(`Automodルールが作成されました。\nスパムの疑いのあるメッセージはすべてブロックされます。`);

                    await interaction.editReply({ embeds: [embed3] });
                }, 3000);

                break;

            case 'mention-spam':
                const number = options.getInteger('number');
                ruleExists = existingRules.some(rule => rule.triggerType === 5 && rule.triggerMetadata.mentionTotalLimit === number);
                if (ruleExists) {
                    return interaction.reply({ content: '既にこのAutomodルールは設定済みです。', flags: MessageFlags.Ephemeral });
                }

                await interaction.reply({ content: `Loading your automod rule...` });

                const rule4 = await guild.autoModerationRules.create({
                    name: `Block Mention Spam`,
                    creatorid: 'your-application-id-goes-here',
                    enabled: true,
                    eventType: 1,
                    triggerType: 5,
                    triggerMetadata: {
                        mentionTotalLimit: number
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                channel: interaction.channel,
                                durationSeconds: 10,
                                customMessage: 'このメッセージはお掃除上方修正しろbotによってブロックされました。'
                            }
                        }
                    ]
                }).catch(async err => {
                    setTimeout(async () => {
                        await interaction.editReply({ content: 'エラーが発生しました。' });
                    }, 2000);
                });

                setTimeout(async () => {
                    if (!rule4) return;

                    const embed4 = new EmbedBuilder()
                        .setAuthor({ name: '✅｜成功' })
                        .setColor("#3498db")
                        .setDescription(`Automodルールが作成されました。\n${number}個以上のメンションを含んだメッセージはすべてブロックされます。`);

                    await interaction.editReply({ embeds: [embed4] });
                }, 3000);

                break;
        }
    }
};