const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('このbotのサポートサーバーの招待リンクを貼ります'),
	async execute(interaction) {
		try {
			await interaction.reply('https://discord.gg/dE3JpBXjnx');
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};