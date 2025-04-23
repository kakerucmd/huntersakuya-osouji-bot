const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roulette')
		.setDescription('ルーレットを回します')
		.addStringOption(option =>
			option.setName('words')
			.setDescription('カンマ区切りで3~8個のワードを入力してください')
			.setRequired(true)),
	async execute(interaction) {
		try {
			let inputWords = interaction.options.getString('words').split(',').map(w =>
				w.trim()).filter(w => w);
			if (inputWords.length < 3 || inputWords.length > 8) {
				return await interaction.reply('3〜8個のワードをカンマで区切って入力してください。');
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
					emojis
					.map((emoji, i) => `${emoji} → ${i + 1}`)
					.join('\n') +
					`\n\n⬛：未使用スロット\n🟨：当たりの場所（下中央）`
				);
			};

			const buildEmbed = (title, boardContent) => {
				return new EmbedBuilder()
					.setTitle(title)
					.setColor("Blurple")
					.addFields({
						name: 'スロットボード',
						value: `\`\`\`\n${boardContent}\n\`\`\``
					}, {
						name: '絵文字対応表',
						value: renderLegend()
					});
			};

			await interaction.reply({
				embeds: [buildEmbed('🎰 ルーレットを回します！', renderBoard())],
				fetchReply: true
			});

			const resultEmoji = validEmojis[Math.floor(Math.random() * validEmojis.length)];

			const fakeSpins = 16;
			for (let i = 0; i < fakeSpins; i++) {
				spinningEmojis.unshift(spinningEmojis.pop());
				await interaction.editReply({
					embeds: [buildEmbed('🎰 回転中...', renderBoard())]
				});
				await new Promise(r => setTimeout(r, 150));
			}

			let spinCount = 0;
			const maxSpin = 60;

			const interval = setInterval(async() => {
				try {
					spinningEmojis.unshift(spinningEmojis.pop());
					spinCount++;
					await interaction.editReply({
						embeds: [buildEmbed('🎰 回転中...', renderBoard())]
					});

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