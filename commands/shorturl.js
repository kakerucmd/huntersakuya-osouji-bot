const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shorturl')
		.setDescription('短縮URLを生成します')
		.addStringOption(option => 
			option.setName('url')
				.setDescription('短縮するURL')
				.setRequired(true)),
	async execute(interaction) {
		const url = interaction.options.getString('url');
		if (!url.startsWith('https://')) {
			await interaction.reply({ content: '`https://` から始まるURLのみ短縮できます。', flags: MessageFlags.Ephemeral });
			return;
		}
		try {
			let createResult = await createShortLink(url);
			if (createResult.code == 200) {
				await interaction.reply({ content: `短縮URLを生成しました: ${createResult.shorturl}`, flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: `URLの短縮に失敗しました。`, flags: MessageFlags.Ephemeral });
			}
		} catch (error) {
			await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
		}
	},
};

async function createShortLink(url) {
	try {
		const response = await axios.get("https://ur0.cc/api.php?create=true&url="+encodeURIComponent(url));
		return response.data;
	} catch (error) {
		throw error;
	}
}