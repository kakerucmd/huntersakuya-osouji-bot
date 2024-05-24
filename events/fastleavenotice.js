const { Events } = require('discord.js');
const Keyv = require('keyv');
const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leaveChannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });

module.exports = {
	name: Events.GuildMemberRemove,
	once: false,
	async execute(member) {
        const joinTimestamp = global.joinTimestamps.get(member.id);
        const leaveTimestamp = Date.now();
        const diffMinutes = (leaveTimestamp - joinTimestamp) / 1000 / 60;
    
        if (diffMinutes <= 10) {
            const isEnabled = await toggleleave.get(member.guild.id);
            if (isEnabled) {
                const channelId = await leaveChannel.get(member.guild.id);
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    channel.send(`${member.user}が即抜けしました`);
                }
            }
        }
    
        global.joinTimestamps.delete(member.id);
	},
};