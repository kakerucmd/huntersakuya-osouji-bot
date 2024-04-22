const { Events } = require('discord.js');
const Keyv = require('keyv');
const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });
let lastReplyTime = {};

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        if (message.author.bot) return;

        let triggerWord;
        if (message.content.includes('お掃除上方修正')) {
            triggerWord = 'お掃除上方修正';
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
                    const lastReply = lastReplyTime[message.guild.id];
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
                        const escapedTriggerWord = triggerWord.replace(/@everyone/g, "").replace(/@here/g, "");
                        await message.channel.sendTyping();
                        setTimeout(async () => {
                            try {
                                await message.reply({ content: `${escapedTriggerWord}...？上方修正....お掃除...お掃除上方修正しろ！！！！` });
                            } catch (error) {
                                console.log(error)
                                await message.channel.send(`${escapedTriggerWord}...？上方修正....お掃除...お掃除上方修正しろ！！！！`);
                            }
                        }, 1000);
                    }
                    lastReplyTime[message.guild.id] = now;
                    setTimeout(() => {
                        delete lastReplyTime[message.guild.id];
                    }, 10000);
                }
            } catch (error) {
                console.error(`エラーが発生しました: ${error}`);
            }
        }
    },
};