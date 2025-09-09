const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('クイズを開始します')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('クイズの問題を入力してください')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('answer')
                .setDescription('クイズの答えを入力してください')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('クイズの時間（分）を入力してください')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('クイズの時間（秒）を入力してください')
                .setRequired(false)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const answer = interaction.options.getString('answer');
        let minutes = interaction.options.getInteger('minutes');
        let seconds = interaction.options.getInteger('seconds');

        if (minutes === null && seconds === null) {
            return await interaction.reply({ content: 'エラー：時間を指定してください。', flags: MessageFlags.Ephemeral });
        }

        minutes = minutes ? minutes : 0;
        seconds = seconds ? seconds : 0;

        if (minutes < 0 || seconds < 0) {
            return await interaction.reply({ content: 'エラー：時間は0以上の値でなければなりません。', flags: MessageFlags.Ephemeral });
        }

        if (isNaN(minutes) || isNaN(seconds)) {
            return await interaction.reply({ content: 'エラー：時間は数値でなければなりません。', flags: MessageFlags.Ephemeral });
        }

        const time = minutes * 60 + seconds;
        await interaction.reply({ content: 'クイズを開始します...', flags: MessageFlags.Ephemeral });
        const embed = new EmbedBuilder()
            .setAuthor({ name: '❓｜クイズ' })
            .setDescription(`${interaction.user}さんが送信した問題\n${question}`)
            .setColor("Blurple");
        const questionMessage = await interaction.channel.send({ embeds: [embed] });
        const filter = m => m.content === answer;
        const collector = interaction.channel.createMessageCollector({ filter, time: time * 1000 });
        collector.on('collect', async m => {
            if (m.content === answer) {
                await questionMessage.reply(`${m.author}さんが正解しました！`).catch(console.error);
                collector.stop('correct');
            }
        });
        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                try {
                    await questionMessage.reply('時間切れです。正解は ' + answer + ' でした。');
                } catch (error) {
                    try {
                        await interaction.channel.send('時間切れです。正解は ' + answer + ' でした。');
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        });        
    },
};