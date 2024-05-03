const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const joinleavelog = new Keyv('sqlite://db.sqlite', { table: 'joinleavelog' });

module.exports = {
	name: Events.GuildMemberRemove,
	once: false,
	async execute(member) {
        const data = await joinleavelog.get(member.guild.id);
        if (!data) return;
        else {
            const channel = await member.guild.channels.cache.get(data.channel)
            const embed = new EmbedBuilder()
            .setAuthor({
                name: `${member.guild.name}`,
                iconURL: `${member.guild.iconURL()}`
              })  
            .setDescription(`**${member.user.username}**(${member.id})さんが\n**${member.guild.name}**から退出しました`)
            .setColor("Blurple")
            .setTimestamp();
            await channel.send({ embeds: [embed] }).catch(err => {});
        }
	},
};
