const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const reactionrole = new Keyv('sqlite://db.sqlite', { table: 'reactionrole' });

module.exports = {
    name: Events.MessageReactionAdd,
    once: false,
    async execute(reaction, user) {
        try {
            if (user.bot) return;

            const messageId = reaction.message.id;
            const panelData = await reactionrole.get(`${reaction.message.guild.id}-${messageId}`);

            if (panelData) {
                const emoji = reaction.emoji.name;
                const member = await reaction.message.guild.members.fetch(user.id);
                const roleId = panelData[emoji];

                if (roleId) {
                    const role = reaction.message.guild.roles.cache.get(roleId);
                    if (role) {
                        let action;
                        let color;
                        if (member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            color = "#ff0000";
                            action = '削除しました';
                        } else {
                            await member.roles.add(role);
                            color = "#00ff00";
                            action = '付与しました';
                        }

                        const embed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`${role}を${action}`);

                        const sendMessage = await reaction.message.channel.send({ content: `${member} `, embeds: [embed] });

                        setTimeout(async () => {
                            await sendMessage.delete();
                        }, 3000);
                    }
                }
                await reaction.users.remove(user.id);
            }
        } catch (error) {
            console.error(error);
        }
    },
};