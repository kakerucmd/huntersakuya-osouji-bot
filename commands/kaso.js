const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kaso')
		.setDescription('過疎化注意の画像を貼ります'),
	async execute(interaction) {
		try {
			const file = new AttachmentBuilder('../images/kaso.png');
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('サーバーが過疎化しています')
				.setImage('attachment://kaso.png');
			await interaction.reply({ embeds: [embed], files: [file] });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};
