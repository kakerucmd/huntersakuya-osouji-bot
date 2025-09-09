const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('osouji')
		.setDescription('お掃除上方修正しろ！！と返します'),
	async execute(interaction) {
		try {
			await interaction.reply('お掃除上方修正しろ！！');
		} catch (error) {
			console.error(`/osoujiでエラー発生: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
		}
	},
};