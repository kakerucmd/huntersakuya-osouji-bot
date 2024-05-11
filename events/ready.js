const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`お掃除上方修正しろ！！(${client.user.tag}が起動しました)`);
	},
};