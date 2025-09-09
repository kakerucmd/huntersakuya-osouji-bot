const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, MessageFlags } = require('discord.js');
const { createEmbed } = require('../functions/createembed');

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
            await interaction.reply({ content: '既にハイ＆ローを実行しているようです。\n「ゲームを中止する」ボタンを押してから、コマンドを実行してください。', flags: MessageFlags.Ephemeral });
            return;
        }

        if (rounds <= 0 || rounds > 10) {
            await interaction.reply({ content: `1~10までの数を入力してください。`, flags: MessageFlags.Ephemeral });
            return;
        }

        activehighlow.set(userId, true);

        let count = 0;
        let correctCount = 0;
        let number = Math.floor(Math.random() * 9) + 1;

        const highButton = new ButtonBuilder()
            .setCustomId(`high_${userId}`)
            .setLabel('High')
            .setStyle(ButtonStyle.Primary);

        const lowButton = new ButtonBuilder()
            .setCustomId(`low_${userId}`)
            .setLabel('Low')
            .setStyle(ButtonStyle.Success);

        const stopButton = new ButtonBuilder()
            .setCustomId(`stop_${userId}`)
            .setLabel('ゲームを中止する')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(highButton, lowButton, stopButton);

        await interaction.deferReply();
        let embed = createEmbed('✅｜ハイ＆ローの開始に成功', "Blurple", `現在の数は${number}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
        await interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [row] });

        const filter = i => i.customId.endsWith(`_${userId}`) && i.user.id === userId;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            if (i.customId === `stop_${userId}`) {
                collector.stop('stopped');
                return;
            }
        
            const guess = i.customId.split('_')[0];
            let nextNumber;
            do {
                nextNumber = Math.floor(Math.random() * 9) + 1;
            } while (nextNumber === number);
        
            if ((guess === 'high' && nextNumber > number) || (guess === 'low' && nextNumber < number)) {
                correctCount++;
                embed = createEmbed('⭕️｜正解', guess === 'high' ? "Blurple" : "DarkGreen", `次の数は${nextNumber}でした。現在の数は${nextNumber}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
            } else {
                embed = createEmbed('❌｜不正解', guess === 'high' ? "Blurple" : "DarkGreen", `次の数は${nextNumber}でした。現在の数は${nextNumber}です。\n次の数は現在の数より高い(high)と思いますか？\nそれとも低い(low)と思いますか？`);
            }

            try {
                await i.update({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            } catch (error) {
                console.error(error);
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
                embed = createEmbed('🛑｜中止', '#ff0000', 'ゲームを中止しました。');
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            } else if (collected.size === 0 || count < rounds) {
                embed = createEmbed('❌｜エラー', '#00ff00', '入力がタイムアウトしました');
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            } else {
                embed = createEmbed('✨｜結果', "Blurple", `${rounds}回のハイ＆ローが終了しました。\n計${correctCount}回正解しました！`);
                interaction.editReply({ content: `${interaction.user}`, embeds: [embed], components: [] });
            }
        });
    },
};