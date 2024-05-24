const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');

const activehighlow = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highlow')
        .setDescription('ハイ＆ローを開始します')
        .addIntegerOption(option => 
            option.setName('rounds')
                .setDescription('何回しますか？(最大10回)')
                .setRequired(true)),
    async execute(interaction) {
        const rounds = interaction.options.getInteger('rounds');
        const userId = interaction.user.id;

        if (activehighlow.has(userId)) {
            await interaction.reply({ content: '既にハイ＆ローを実行しているようです。\n「ゲームを中止する」ボタンを押してから、コマンドを実行してください。', ephemeral: true });
            return;
        }

        if (rounds <= 0 || rounds > 10) {
            await interaction.reply({ content: `1~10までの数を入力してください。`, ephemeral: true });
            return;
        }

        activehighlow.set(userId, true);

        let count = 0;
        let correctCount = 0;
        let number = Math.floor(Math.random() * 9) + 1;

        const highButton = new ButtonBuilder()
            .setCustomId('high')
            .setLabel('High')
            .setStyle(ButtonStyle.Primary);

        const lowButton = new ButtonBuilder()
            .setCustomId('low')
            .setLabel('Low')
            .setStyle(ButtonStyle.Success);

        const stopButton = new ButtonBuilder()
            .setCustomId('stop')
            .setLabel('ゲームを中止する')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(highButton, lowButton, stopButton);

        await interaction.deferReply();
        let embed = new EmbedBuilder()
            .setAuthor({ name: '✅｜ハイ＆ローの開始に成功' })
            .setColor("Blurple")
            .setDescription(`現在の数は${number}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
        await interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [row] });

        const filter = i => {
            if ((i.customId === 'high' || i.customId === 'low' || i.customId === 'stop') && i.user.id !== userId) {
                i.deferUpdate().then(() => {
                    i.followUp({ content: 'これはあなたが開始したハイ＆ローではありません。\n`/highlow`で、自分のゲームを開始してください。', ephemeral: true });
                });
                return false;
            }
            return (i.customId === 'high' || i.customId === 'low' || i.customId === 'stop') && i.user.id === userId;
        };
        
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            if (i.customId === 'stop') {
                collector.stop('stopped');
                return;
            }
        
            const guess = i.customId;
            let nextNumber;
            do {
                nextNumber = Math.floor(Math.random() * 9) + 1;
            } while (nextNumber === number);
        
            if ((guess === 'high' && nextNumber > number) || (guess === 'low' && nextNumber < number)) {
                correctCount++;
                embed = new EmbedBuilder()
                    .setAuthor({ name: '⭕️｜正解' })
                    .setColor(guess === 'high' ? "Blurple" : "DarkGreen")
                    .setDescription(`次の数は${nextNumber}でした。現在の数は${nextNumber}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
                await i.update({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            } else {
                embed = new EmbedBuilder()
                    .setAuthor({ name: '❌｜不正解' })
                    .setColor(guess === 'high' ? "Blurple" : "DarkGreen")
                    .setDescription(`次の数は${nextNumber}でした。現在の数は${nextNumber}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
                await i.update({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            }
        
            count++;
            number = nextNumber;
        
            if (count >= rounds) {
                collector.stop();
            }
        });        

        collector.on('end', (collected, reason) => {
            activehighlow.delete(userId);

            if (reason === 'stopped') {
                embed = new EmbedBuilder()
                    .setAuthor({ name: '🛑｜中止' })
                    .setColor('#ff0000')
                    .setDescription('ゲームを中止しました。');
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            } else if (collected.size === 0 || count < rounds) {
                embed = new EmbedBuilder()
                    .setAuthor({ name: '❌｜エラー' })
                    .setColor('#00ff00')
                    .setDescription('入力がタイムアウトしました');
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            } else {
                embed = new EmbedBuilder()
                    .setAuthor({ name: '✨｜結果' })
                    .setColor("Blurple")
                    .setDescription(`${rounds}回のハイ＆ローが終了しました。\n計${correctCount}回正解しました！`);
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            }
        });
    },
};