const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('ルーレットを回します')
        .addStringOption(option => option.setName('word1').setDescription('1つ目のワード(必須)').setRequired(true))
        .addStringOption(option => option.setName('word2').setDescription('2つ目のワード(必須)').setRequired(true))
        .addStringOption(option => option.setName('word3').setDescription('3つ目のワード(必須)').setRequired(true))
        .addStringOption(option => option.setName('word4').setDescription('4つ目のワード(任意)').setRequired(false))
        .addStringOption(option => option.setName('word5').setDescription('5つ目のワード(任意)').setRequired(false))
        .addStringOption(option => option.setName('word6').setDescription('6つ目のワード(任意)').setRequired(false))
        .addStringOption(option => option.setName('word7').setDescription('7つ目のワード(任意)').setRequired(false))
        .addStringOption(option => option.setName('word8').setDescription('8つ目のワード(任意)').setRequired(false)),

    async execute(interaction) {
        try {
            const inputWords = [];
            for (let i = 1; i <= 8; i++) {
                const w = interaction.options.getString(`word${i}`);
                if (w) inputWords.push(w.trim());
            }

            if (inputWords.length < 3) {
                return interaction.reply('最低3個のワードを入力してください。');
            }

            const emojiPool = ['🍎', '🍌', '🍒', '🍉', '🍇', '🍓', '🍍', '🍋'];
            const emojiMap = {};
            inputWords.forEach((word, i) => {
                emojiMap[emojiPool[i]] = word;
            });

            const emojis = Object.keys(emojiMap);
            const blanks = Array(8 - emojis.length).fill('⬛');
            let spinningEmojis = emojis.concat(blanks);
            const validEmojis = emojis;

            const rotationIndexes = [0, 1, 2, 3, 4, 5, 6, 7];
            const board = Array(9).fill('❓');

            const renderBoard = () => {
                const visual = [...board];
                rotationIndexes.forEach((pos, i) => {
                    visual[pos] = spinningEmojis[i];
                });
                return (
                    `🟦🟦🟦🟦🟦\n` +
                    `🟦${visual[0]}${visual[1]}${visual[2]}🟦\n` +
                    `🟦${visual[7]}🟩${visual[3]}🟦\n` +
                    `🟦${visual[6]}${visual[5]}${visual[4]}🟦\n` +
                    `🟦🟦🟨🟦🟦`
                );
            };

            const renderLegend = () => {
                return (
                    inputWords
                        .map((word, i) => `${emojiPool[i]} → ${word}`)
                        .join('\n') +
                    `\n\n⬛：未使用スロット\n🟨：当たり（下中央）`
                );
            };

            const buildEmbed = (title, boardContent) => {
                return new EmbedBuilder()
                    .setTitle(title)
                    .setColor('Blurple')
                    .addFields(
                        { name: 'スロットボード', value: `\`\`\`\n${boardContent}\n\`\`\`` },
                        { name: '絵文字対応表', value: renderLegend() }
                    );
            };

            await interaction.reply({
                embeds: [buildEmbed('🎰 ルーレットを回します！', renderBoard())],
                fetchReply: true
            });

            const resultEmoji = validEmojis[Math.floor(Math.random() * validEmojis.length)];

            const fakeSpins = 16;
            for (let i = 0; i < fakeSpins; i++) {
                spinningEmojis.unshift(spinningEmojis.pop());
                await interaction.editReply({ embeds: [buildEmbed('🎰 回転中...', renderBoard())] });
                await new Promise(r => setTimeout(r, 150));
            }

            let spinCount = 0;
            const maxSpin = 60;

            const interval = setInterval(async () => {
                try {
                    spinningEmojis.unshift(spinningEmojis.pop());
                    spinCount++;
                    await interaction.editReply({ embeds: [buildEmbed('🎰 回転中...', renderBoard())] });

                    if (spinningEmojis[5] === resultEmoji || spinCount >= maxSpin) {
                        clearInterval(interval);
                        const resultWord = emojiMap[resultEmoji] || 'ハズレ';
                        await interaction.editReply({
                            embeds: [buildEmbed(`🎯「${resultWord}」が当選しました！`, renderBoard())]
                        });
                    }
                } catch (_) {}
            }, 400);

        } catch (_) {}
    }
};
