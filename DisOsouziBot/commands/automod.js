const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Automodを設定します')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand(command => command.setName('flagged-words').setDescription('冒涜的な言葉、性的な内容、中傷をブロック(現状は英語のみ対応)'))
    .addSubcommand(command => command.setName('spam-messages').setDescription('スパムの疑いのあるメッセージをブロック'))
    .addSubcommand(command => command.setName('mention-spam').setDescription('指定した数以上のメンションを含むメッセージをブロックする').addIntegerOption(option => option.setName('number').setDescription('The number of mentions required to block a message').setRequired(true)))
    .addSubcommand(command => command.setName('keyword').setDescription('指定したキーワードをサーバー内でブロックする').addStringOption(option => option.setName('word').setDescription('the word you want block').setRequired(true))),
    async execute(interaction) {

        const { guild, options } = interaction;
        const sub = options.getSubcommand();

        switch (sub) {
            case 'flagged-words':
            
            await interaction.reply({ content: `Loading your automod rule...` })

            const rule = await guild.autoModerationRules.create({
                name: `Block profanity, sexual content, and siurs by お掃除上方修正しろbot`,
                creatorid: `1175248665972060160`,
                enabled:true,
                eventType:1,
                triggerType: 4,
                triggerMetadata:
                {
                    presets: [1, 2, 3]
                },
                actions:[
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
            setTimeout(async () =>{
                console.log(err);
                await interaction.editReply({ content: 'エラーが発生しました。' });
            }, 2000)
        })

        setTimeout(async () => {
            if (!rule) return;

            const embed = new EmbedBuilder()
            .setAuthor({ name: '✅｜成功' })
            .setColor("#3498db")
            .setDescription(`Automodルールが作成されました。不適切な発言はブロックされます。`)

            await interaction.editReply({ embeds: [embed] });
        }, 3000)

        break;

            case 'keyword':

            await interaction.reply({ content: `Loading your automod rule...` })
            const word = options.getString('word');

            const rule2 = await guild.autoModerationRules.create({
                name: `Prevent the word ${word} from being userd by お掃除上方修正しろbot`,
                creatorid: `1175248665972060160`,
                enabled:true,
                eventType:1,
                triggerType:1,
                triggerMetadata:
                    {
                        keywordFilter: [`${word}`]
                    },
                actions:[
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
            setTimeout(async () =>{
                console.log(err);
                await interaction.editReply({ content: 'エラーが発生しました。' });
            }, 2000)
        })

        setTimeout(async () => {
            if (!rule2) return;

            const embed2 = new EmbedBuilder()
            .setAuthor({ name: '✅｜成功' })
            .setColor("#3498db")
            .setDescription(`Automodルールが作成されました。\n"${word}"を含むメッセージはすべてブロックされます。`)

            await interaction.editReply({ embeds: [embed2] });
            }, 3000)

            break;

            case 'spam-messages':

            await interaction.reply({ content: `Loading your automod rule...` })

            const rule3 = await guild.autoModerationRules.create({
                name: `Prevent spam messages by お掃除上方修正しろbot`,
                creatorid: `1175248665972060160`,
                enabled:true,
                eventType:1,
                triggerType:3,
                triggerMetadata:
                    {

                    },
                actions:[
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
            setTimeout(async () =>{
                console.log(err);
                await interaction.editReply({ content: 'エラーが発生しました。' });
            }, 2000)
        })

        setTimeout(async () => {
            if (!rule3) return;

            const embed3 = new EmbedBuilder()
            .setAuthor({ name: '✅｜成功' })
            .setColor("#3498db")
            .setDescription(`Automodルールが作成されました。\nスパムの疑いのあるメッセージはすべてブロックされます。`)

            await interaction.editReply({ embeds: [embed3] });
            }, 3000)

            break;

            case 'mention-spam':

            await interaction.reply({ content: `Loading your automod rule...` })
            const number = options.getInteger('number');

            const rule4 = await guild.autoModerationRules.create({
                name: `Prevent spam mentions by お掃除上方修正しろbot`,
                creatorid: `1175248665972060160`,
                enabled:true,
                eventType:1,
                triggerType:5,
                triggerMetadata:
                    {
                        mentionTotalLimit: number,
                    },
                actions:[
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
            setTimeout(async () =>{
                console.log(err);
                await interaction.editReply({ content: 'エラーが発生しました。' });
            }, 2000)
        })

        setTimeout(async () => {
            if (!rule4) return;

            const embed4 = new EmbedBuilder()
            .setAuthor({ name: '✅｜成功' })
            .setColor("#3498db")
            .setDescription(`Automodルールが作成されました。\n${number}個以上のメンションを含んだメッセージはすべてブロックされます。`)

            await interaction.editReply({ embeds: [embed4] });
            }, 3000)

        }
    }
}
