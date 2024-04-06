const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('osouji_image')
		.setDescription('お掃除上方修正しろの写真を返します(表示に時間がかかる場合があります)'),
	async execute(interaction) {
		try {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('お掃除上方修正しろ！！')
				.setImage('https://gsapi.cbrx.io/image?top=%E3%81%8A%E6%8E%83%E9%99%A4&bottom=%E4%B8%8A%E6%96%B9%E4%BF%AE%E6%AD%A3%E3%81%97%E3%82%8D%EF%BC%81%EF%BC%81&type=png');
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};