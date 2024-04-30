const { SlashCommandBuilder } = require('discord.js')
const request = require('request');

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
			await interaction.reply({ content: '`https://` から始まるURLのみ短縮できます。', ephemeral: true });
			return;
		}
		try {
			let createResult = await createShortLink(url);
			if (createResult.code == 200) {
				await interaction.reply({ content: `短縮URLを生成しました: ${createResult.shorturl}`, ephemeral: true });
			} else {
				await interaction.reply({ content: `URLの短縮に失敗しました。`, ephemeral: true });
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: `エラーが発生しました。`, ephemeral: true });
		}
	},
};

function createShortLink(url) {
	return new Promise((resolve, reject) => {
		request({
			url: "https://ur0.cc/api.php?create=true&url="+encodeURIComponent(url),
			json: true
		}, function (error, response, body) {
			if (error) {
				reject(error);
			} else {
				resolve(body);
			}
		});
	});
}