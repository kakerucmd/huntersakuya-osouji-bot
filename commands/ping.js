const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('botの反応速度を計測します'),
	async execute(interaction) {
		try {
			await interaction.reply(`WebSocket Ping: ${interaction.client.ws.ping}ms\nAPI Endpoint Ping: ...`);
			let msg = await interaction.fetchReply();
			await interaction.editReply(`WebSocket Ping: ${interaction.client.ws.ping}ms\nAPI Endpoint Ping: ${msg.createdTimestamp - interaction.createdTimestamp}ms`);
		} catch (error) {
			console.error(`/pingでエラー発生: ${error}`);
			await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
		}
	},
};