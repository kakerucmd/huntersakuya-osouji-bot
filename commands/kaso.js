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
				.setImage('https://media.discordapp.net/attachments/1160798192166776892/1163409629527679058/image.png?ex=66301266&is=662ec0e6&hm=7234104c5ce32316ccd951c4efe091b531215a8bd8041f8dabb177ff009b4798&=&format=webp&quality=lossless&width=1178&height=662');
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};
