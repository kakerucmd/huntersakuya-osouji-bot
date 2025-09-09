const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
        global.joinTimestamps.set(member.id, Date.now());
	},
};