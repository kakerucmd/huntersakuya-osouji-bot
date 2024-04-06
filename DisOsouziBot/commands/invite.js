const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('このbotの招待リンクを表示します'),
	async execute(interaction) {
		try {
			await interaction.reply({ content: `https://discord.com/api/oauth2/authorize?client_id=1175248665972060160&permissions=8&scope=applications.commands%20bot \nここからこのbotを導入できます`, ephemeral: true });
		} catch (error) {
			console.error(`エラーが発生しました: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
		}
	},
};