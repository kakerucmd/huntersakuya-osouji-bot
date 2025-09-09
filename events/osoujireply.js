const { Events, Collection } = require('discord.js');
const Keyv = require('keyv');

const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });
const lastReplyTime = new Collection();

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        if (message.author.bot) return;

        let triggerWord;
        if (message.content.includes('お掃除上方修正しろ')) {
            triggerWord = 'お掃除上方修正しろ';
        } else if (message.content.includes('お掃除上方修正')) {
            triggerWord = 'お掃除上方修正';
        } else if (message.content.includes('大掃除')) {
            triggerWord = '大掃除';
        } else if (message.content.includes('お掃除')) {
            triggerWord = 'お掃除';
        } else if (message.content.includes('上方修正')) {
            triggerWord = '上方修正';
        }

        if (triggerWord) {
            try {
                const isEnabled = await osouzireply.get(message.guild.id);
                if (isEnabled) {
                    const now = Date.now();
                    const lastReply = lastReplyTime.get(message.guild.id);
                    if (lastReply && now - lastReply < 10000) {
                        await message.channel.sendTyping();
                        setTimeout(async () => {
                            try {
                                await message.reply('お掃除上方修正s(((ry');
                            } catch (error) {
                                await message.channel.send(`お掃除上方修正s(((ry`);
                            }
                        }, 1000);
                    } else {
                        let replyMessage = '';
                        if (triggerWord === 'お掃除上方修正しろ') {
                            replyMessage = 'お掃除上方修正しろ！(便乗)';
                        } else if (triggerWord === 'お掃除上方修正') {
                            replyMessage = 'しろ！！';
                        } else if (triggerWord === '大掃除') {
                            replyMessage = '大掃除...？お掃除...逆襲....お掃除逆襲しろ！！';
                        } else {
                            const escapedTriggerWord = triggerWord.replace(/@everyone/g, "").replace(/@here/g, "");
                            replyMessage = `${escapedTriggerWord}...？上方修正....お掃除...お掃除上方修正しろ！！！！`;
                        }
                        await message.channel.sendTyping();
                        setTimeout(async () => {
                            try {
                                await message.reply({ content: replyMessage });
                            } catch (error) {
                                console.log(error)
                                await message.channel.send(replyMessage);
                            }
                        }, 1000);
                    }
                    lastReplyTime.set(message.guild.id, now);
                    setTimeout(() => {
                        lastReplyTime.delete(message.guild.id);
                    }, 10000);
                }
            } catch (error) {
                console.error(`エラーが発生しました: ${error}`);
            }
        }
    },
};
