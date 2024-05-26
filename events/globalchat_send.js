const { Events, EmbedBuilder, WebhookClient } = require('discord.js');
const Keyv = require('keyv');
const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });
const userTokenViolations = new Keyv('sqlite://db.sqlite', { table: 'TokenViolations' });
const userSpamCounts = new Keyv('sqlite://db.sqlite', { table: 'SpamCounts' });
const userMessageTimestamps = new Map();
const userMessageCounts = new Map();
const globalMessageQueue = [];
const userLastMessageTimes = new Map();
const userPenaltyTimestamps = new Map();

async function sendQueuedMessage() {
    const message = globalMessageQueue.shift();
    if (message) {
        const now = Date.now();
        const lastMessageTime = userLastMessageTimes.get('global') || now;
        const delay = now - lastMessageTime < 1000 ? 1000 - (now - lastMessageTime) : 0;
        setTimeout(async () => {
            userLastMessageTimes.set('global', now + delay);
            const channels = await globalchannels.get('globalchannels');
            const targetChannels = Object.keys(channels).filter(id => id !== message.channel.id);
            targetChannels.forEach(async id => {
                const webhookURL = channels[id];
                if (webhookURL) {
                    const webhook = new WebhookClient({ url: webhookURL });
                    try {
                        let files = [];
                        if (message.attachments.size > 0) {
                            message.attachments.each(attachment => {
                                files.push({
                                    attachment: attachment.url,
                                    name: attachment.name
                                });
                            });
                        }
                        let content = message.content;
                        const mentions = message.mentions.users;
                        mentions.each(user => {
                            content = content.replace(new RegExp(`<@!?${user.id}>`, 'g'), `＠${user.username}`);
                        });
                        content = content.replace(/@everyone/g, '＠everyone');
                        content = content.replace(/@here/g, '＠here');
                        webhook.send({
                            content: content,
                            files: files,
                            username: `${message.author.username} (${message.guild.name}から送信)`,
                            avatarURL: message.author.displayAvatarURL()
                        }).then(() => {
                            message.react('✅');
                        }).catch(async error => {
                            console.error(`Webhookへのメッセージ送信中にエラーが発生しました: ${error}\nWebhookURL:${webhookURL}`);
                            if (error.code === 10015) {
                                const channels = await globalchannels.get('globalchannels');
                                delete channels[id];
                                await globalchannels.set('globalchannels', channels);
                            }
                        });
                    } catch (error) {
                        console.error(`エラーが発生しました: ${error}`);
                    }
                }
            });
            if (globalMessageQueue.length > 0) {
                sendQueuedMessage();
            }
        }, delay);
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            if (!message.author.bot) {
                const channels = await globalchannels.get('globalchannels');
                if (channels && channels[message.channel.id]) {
                    let userTokenViolationCount = await userTokenViolations.get(message.author.id);
                    let userSpamCount = await userSpamCounts.get(message.author.id);
                    if (userTokenViolationCount >= 3) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: '❌｜エラー' })
                            .setDescription(`あなたは3回以上Token類似文字列を含むメッセージを送信したため、\nグローバルチャットにメッセージは転送されません。`)
                            .setColor('#ff0000');
                        message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                        message.react('❌');
                        return;
                    }
                    if (userSpamCount >= 3) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: '❌｜エラー' })
                            .setDescription(`あなたは3回以上スパムを行ったため、\nグローバルチャットにメッセージは転送されません。`)
                            .setColor('#ff0000');
                        message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                        message.react('❌');
                        return;
                    }
                    const now = Date.now();
                    userLastMessageTimes.set('global', now);
                    const containsToken = /([a-zA-Z0-9-_]{24}\.[a-zA-Z0-9-_]{6}\.[a-zA-Z0-9-_]{27})|mfa\.[a-z0-9_-]{20,}/i.test(message.content);
                    if (containsToken) {
                        userTokenViolationCount = userTokenViolationCount ? userTokenViolationCount + 1 : 1;
                        await userTokenViolations.set(message.author.id, userTokenViolationCount);
                        if (userTokenViolationCount < 3) {
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: '❌｜警告' })
                                .setDescription(`Token類似文字列を含むメッセージは送信できません。\n3回以上グローバルチャットにToken類似文字列を送信した場合、\nあなたはグローバルチャットが使用不可能になります。`)
                                .setColor('#ff0000');
                            message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                            message.react('❌');
                            return;
                        }
                    }
                    if (message.content.trim() !== '' || message.attachments.size > 0) {
                        const userKey = `${message.author.id}-${message.content}`;
                        const lastMessageTimestamp = userMessageTimestamps.get(userKey);
                        userMessageTimestamps.set(userKey, now);
                        const userCountKey = `${message.author.id}`;
                        const messageCount = userMessageCounts.get(userCountKey) || 0;
                        userMessageCounts.set(userCountKey, messageCount + 1);
                        if (messageCount >= 4 && (now - lastMessageTimestamp) < 10000) {
                            userSpamCount = userSpamCount ? userSpamCount + 1 : 1;
                            await userSpamCounts.set(message.author.id, userSpamCount);
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: '⚠️｜スパム対策' })
                                .setDescription(`スパムが検出されました。\n1分間メッセージの転送が停止されます。`)
                                .setColor('#ff0000');
                            message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                            message.react('❌');
                            userPenaltyTimestamps.set(message.author.id, now);
                            setTimeout(() => {
                                userMessageCounts.delete(userCountKey);
                            }, 60000);
                            return;
                        }
                        setTimeout(() => {
                            userMessageTimestamps.delete(userKey);
                        }, 5000);
                        const penaltyTimestamp = userPenaltyTimestamps.get(message.author.id);
                        if (penaltyTimestamp && now - penaltyTimestamp < 60000) {
                            message.react('❌');
                            return;
                        }
                        globalMessageQueue.push(message);
                        if (globalMessageQueue.length === 1) {
                            sendQueuedMessage();
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }        
    },
};