const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('huntersakuya')
		.setDescription('お掃除上方修正しろと返します'),
	async execute(interaction) {
		try {
			await interaction.reply('お掃除上方修正しろ');
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};