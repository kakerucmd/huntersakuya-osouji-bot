const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kaso')
		.setDescription('過疎化注意の画像を貼ります'),
	async execute(interaction) {
		try {
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('サーバーが過疎化しています')
				.setImage('https://cdn.discordapp.com/attachments/1160798192166776892/1163409629527679058/image.png?ex=6613ba26&is=66014526&hm=4ff85af42b40d3c7e66e3c9642ca823ed3b0bef1c6e75c6b603caf449fe51e77&');
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};