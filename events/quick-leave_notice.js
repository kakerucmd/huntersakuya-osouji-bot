const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leavechannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });

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
                const channelId = await leavechannel.get(member.guild.id);
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: member.guild.name,
                            iconURL: member.guild.iconURL()
                        })
                        .setDescription(`**${member.user}**(${member.user.id})さんが即抜けしました`)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setColor('Blurple')
                        .setFooter({
                            text: `${Math.floor(diffMinutes)}分${Math.floor((diffMinutes % 1) * 60)}秒で即抜けしました`
                        })
                        .setTimestamp();

                    channel.send({ embeds: [embed] });
                }
            }
        }

        global.joinTimestamps.delete(member.id);
    },
};
