const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`お掃除上方修正しろ！！(${client.user.tag}が起動しました)`);

		setInterval(() => {
			client.user.setActivity(`Ver4.8 | ${client.guilds.cache.size} servers ${client.ws.ping}ms`);
		}, 60000);
	},
};
