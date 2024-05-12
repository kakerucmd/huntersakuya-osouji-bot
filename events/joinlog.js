const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const joinleavelog = new Keyv('sqlite://db.sqlite', { table: 'joinleavelog' });

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
        const data = await joinleavelog.get(member.guild.id);
        if (!data) return;
        else {
            const channel = await member.guild.channels.cache.get(data.channel)
            const embed = new EmbedBuilder()
            .setAuthor({
                name: `${member.guild.name}`,
                iconURL: `${member.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
              })  
            .setDescription(`**${member.user.username}**(${member.id})さんが\n**${member.guild.name}**に参加しました`)
            .setColor("Blurple")
            .setTimestamp();
            await channel.send({ embeds: [embed] }).catch(err => {});
        }
	},
};