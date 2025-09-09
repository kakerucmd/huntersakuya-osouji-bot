const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const joinleavelog = new Keyv('sqlite://db.sqlite', { table: 'joinleavelog' });

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        try {
            const data = await joinleavelog.get(member.guild.id);
            if (!data) return;

            const channel = member.guild.channels.cache.get(data.channel);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${member.guild.name}`,
                    iconURL: `${member.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
                })
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(`
                    **ようこそ、${member.user.username}(${member.user.tag})さん！**  
                    > **ID**: \`${member.id}\`  
                    \n\n⏰ 参加日時: ${new Date().toLocaleString()}
                `)
                .setColor("Blurple")
                .setTimestamp()
                .setFooter({
                    text: `現在のメンバー数: ${member.guild.memberCount}`
                });

            await channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
        }
    },
};
