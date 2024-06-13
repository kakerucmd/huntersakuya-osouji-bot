const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('osouji_image')
		.setDescription('お掃除上方修正しろ！の5000兆円画像を送信します。'),
	async execute(interaction) {
		try {
			const file = new AttachmentBuilder('./images/jouhousyuseisiro.png');
			const embed = new EmbedBuilder()
				.setColor("Blurple")
				.setTitle('お掃除上方修正しろ！！')
				.setImage('attachment://jouhousyuseisiro.png');
			await interaction.reply({ embeds: [embed], files: [file] });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
		}
	},
};