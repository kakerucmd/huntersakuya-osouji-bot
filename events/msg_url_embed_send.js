const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');

const msg_url_embed = new Keyv('sqlite://db.sqlite', { table: 'msgurlembed' });

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            const client = global.client;

            if (!message.guild) return;

            const data = await msg_url_embed.get(message.guild.id);
            if (!data) return;

            if (message.author.id === client.user.id) return;
            if (message.author.bot) return;

            const MESSAGE_URL_REGEX = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
            const matches = MESSAGE_URL_REGEX.exec(message.content);
            if (matches) {
                const [_, guildId, channelId, messageId] = matches;

                const guild = await client.guilds.fetch(guildId);
                const channel = await client.channels.fetch(channelId);
                if (guild.id !== message.guild.id) return;

                const fetchedMessage = await channel.messages.fetch(messageId);

                const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({
                        name: fetchedMessage.author.tag,
                        iconURL: fetchedMessage.author.displayAvatarURL()
                    });

                let imageurl = null;
                let attachmentText = '';
                if (fetchedMessage.attachments.size > 0) {
                    fetchedMessage.attachments.forEach(attachment => {
                        if (attachment.contentType?.startsWith('image/') && !imageurl) {
                            imageurl = attachment.url;
                        } else {
                            attachmentText += `[${attachment.name}](${attachment.url})\n`;
                        }
                    });
                }

                if (imageurl) {
                    embed.setImage(imageurl);
                }

                if (attachmentText) {
                    embed.addFields({ name: '添付ファイル', value: attachmentText.trim() });
                }

                let descriptionText = '';
                if (fetchedMessage.content) {
                    descriptionText += fetchedMessage.content;
                }

                if (fetchedMessage.embeds?.length > 0) {
                    if (descriptionText.length > 0) descriptionText += '\n\n';
                    descriptionText += `(埋め込みメッセージ)`;
                }

                if (fetchedMessage.poll) {
                    const poll = fetchedMessage.poll;
                    const question = poll.question?.text || '(質問不明)';
                    const allowMulti = poll.allowMultiselect;

                    const answers = [...poll.answers.values()]
                        .map(a => a.text ?? '(不明な選択肢)')
                        .filter(Boolean);

                    let pollText = `**Q. ${question}**`;
                    if (answers.length > 0) {
                        pollText += '\n' + answers.map(ans => `- ${ans}`).join('\n');
                    }
                    if (allowMulti) {
                        pollText += `\n(複数回答が可能です)`;
                    }

                    embed.addFields({
                        name: '📊 投票',
                        value: pollText
                    });
                }

                const allReactions = fetchedMessage.reactions.cache.map(r => r.emoji?.toString()).filter(Boolean);
                if (allReactions.length > 0) {
                    const topReactions = allReactions.slice(0, 10);
                    const reactionLine = topReactions.join(' ') + (allReactions.length > 10 ? ' …' : '');
                    embed.addFields({ name: 'リアクション', value: reactionLine });
                }

                if (descriptionText.length > 0) {
                    descriptionText += `\n\n[元メッセージ](${fetchedMessage.url})`;
                } else {
                    descriptionText = `[元メッセージ](${fetchedMessage.url})`;
                }

                embed.setDescription(descriptionText);

                embed.setFooter({
                    text: `${guild.name}`,
                    iconURL: guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'
                }).setTimestamp(fetchedMessage.createdTimestamp);

                await message.channel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};
