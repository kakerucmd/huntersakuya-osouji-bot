const { Events, WebhookClient } = require('discord.js');
const { createEmbed } = require('../functions/createembed');
const Keyv = require('keyv');

const userMessageTimestamps = new Map();
const userMessageCounts = new Map();
const globalMessageQueue = [];
const userLastMessageTimes = new Map();
const userPenaltyTimestamps = new Map();

const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });
const userTokenViolations = new Keyv('sqlite://db.sqlite', { table: 'TokenViolations' });
const userSpamCounts = new Keyv('sqlite://db.sqlite', { table: 'SpamCounts' });

async function sendQueuedMessage() {
    const message = globalMessageQueue.shift();
    if (!message) return;

    const now = Date.now();
    const lastMessageTime = userLastMessageTimes.get('global') || now;
    const delay = Math.max(1000 - (now - lastMessageTime), 0);

    setTimeout(async () => {
        userLastMessageTimes.set('global', Date.now());
        const channels = await globalchannels.get('globalchannels');
        const targetChannels = Object.keys(channels).filter(id => id !== message.channel.id);

        for (const id of targetChannels) {
            const webhookURL = channels[id];
            if (webhookURL) {
                await sendMessageToWebhook(webhookURL, message, id);
            }
        }

        if (globalMessageQueue.length > 0) {
            sendQueuedMessage();
        }
    }, delay);
}

async function sendMessageToWebhook(webhookURL, message, id) {
    const webhook = new WebhookClient({ url: webhookURL });
    try {
        const files = Array.from(message.attachments.values()).map(attachment => ({
            attachment: attachment.url,
            name: attachment.name
        }));

        let content = message.content.replace(/@everyone/g, '＠everyone').replace(/@here/g, '＠here');
        message.mentions.users.each(user => {
            content = content.replace(new RegExp(`<@!?${user.id}>`, 'g'), `＠${user.username}`);
        });

        await webhook.send({
            content: content,
            files: files,
            username: `${message.author.username} (${message.guild.name}から送信)`,
            avatarURL: message.author.displayAvatarURL()
        });

        message.react('✅');
    } catch (error) {
        console.error(`Webhookへのメッセージ送信中にエラーが発生しました: ${error}\nWebhookURL:${webhookURL}`);
        if (error.code === 10015) {
            const channels = await globalchannels.get('globalchannels');
            delete channels[id];
            await globalchannels.set('globalchannels', channels);
        }
    }
}

async function handleTokenViolation(message, userId) {
    const containsToken = /([a-zA-Z0-9-_]{24}\.[a-zA-Z0-9-_]{6}\.[a-zA-Z0-9-_]{27})|mfa\.[a-z0-9_-]{20,}/i.test(message.content);
    if (!containsToken) return false;

    let userTokenViolationCount = (await userTokenViolations.get(userId)) || 0;
    userTokenViolationCount += 1;
    await userTokenViolations.set(userId, userTokenViolationCount);

    if (userTokenViolationCount >= 3) {
        const embed = createEmbed('❌｜エラー', '#ff0000', 'あなたは3回以上Token類似文字列を含むメッセージを送信したため、\nグローバルチャットにメッセージは転送されません。');
        message.channel.send({ content: `<@${userId}>`, embeds: [embed] });
        message.react('❌');
        return true;
    }

    const embed = createEmbed('❌｜警告', '#ff0000', 'Token類似文字列を含むメッセージは送信できません。\n3回以上グローバルチャットにToken類似文字列を送信した場合、\nあなたはグローバルチャットが使用不可能になります。');
    message.channel.send({ content: `<@${userId}>`, embeds: [embed] });
    message.react('❌');
    return true;
}

async function handleSpamDetection(message, userId, userKey, now) {
    const lastMessageTimestamp = userMessageTimestamps.get(userKey);
    userMessageTimestamps.set(userKey, now);
    const messageCount = (userMessageCounts.get(userId) || 0) + 1;
    userMessageCounts.set(userId, messageCount);

    if (messageCount >= 4 && (now - lastMessageTimestamp) < 10000) {
        let userSpamCount = (await userSpamCounts.get(userId)) || 0;
        userSpamCount += 1;
        await userSpamCounts.set(userId, userSpamCount);

        if (userSpamCount >= 3) {
            const embed = createEmbed('❌｜エラー', '#ff0000', 'あなたは3回以上スパムを行ったため、\nグローバルチャットにメッセージは転送されません。');
            message.channel.send({ content: `<@${userId}>`, embeds: [embed] });
            message.react('❌');
            return true;
        }

        const embed = createEmbed('⚠️｜スパム対策', '#ff0000', 'スパムが検出されました。\n1分間メッセージの転送が停止されます。');
        message.channel.send({ content: `<@${userId}>`, embeds: [embed] });
        message.react('❌');
        userPenaltyTimestamps.set(userId, now);
        setTimeout(() => {
            userMessageCounts.delete(userId);
        }, 60000);
        return true;
    }

    setTimeout(() => {
        userMessageTimestamps.delete(userKey);
    }, 5000);

    const penaltyTimestamp = userPenaltyTimestamps.get(userId);
    if (penaltyTimestamp && now - penaltyTimestamp < 60000) {
        message.react('❌');
        return true;
    }

    return false;
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            if (message.author.bot) return;

            const channels = await globalchannels.get('globalchannels');
            if (!channels || !channels[message.channel.id]) return;

            const userId = message.author.id;
            const userKey = `${userId}-${message.content}`;
            const now = Date.now();

            userLastMessageTimes.set('global', now);

            if (await handleTokenViolation(message, userId)) return;
            if (await handleSpamDetection(message, userId, userKey, now)) return;

            if (message.content.trim() !== '' || message.attachments.size > 0) {
                globalMessageQueue.push(message);
                if (globalMessageQueue.length === 1) {
                    sendQueuedMessage();
                }
            }
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};
