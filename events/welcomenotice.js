const { Events } = require('discord.js');
const Keyv = require('keyv');
const welcome = new Keyv('sqlite://db.sqlite', { table: 'welcome' });

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
        const data = await welcome.get(member.guild.id);
        if (!data) return;
        else {
            const channel = await member.guild.channels.cache.get(data.channel)
            await channel.send({ content: `${data.message.replace(`{user}`,member).replace(`{user.name}`,member.user.username).replace(/\\n/g, '\n')}` }).catch(err => {});
        }
	},
};