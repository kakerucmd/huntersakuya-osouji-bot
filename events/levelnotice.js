const { Events } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

const MAX_LEVEL = 99;
const EXP_PER_LEVEL = 10;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            if (message.author.bot) return;
            const isEnabled = await settings.get(message.guild.id);
            if (!isEnabled) return;
            const key = `${message.author.id}-${message.guild.id}`; 
            const level = (await levels.get(key)) || { count: 0, level: 1 };
            const channelId = await channels.get(message.guild.id);
            const customMessage = await messages.get(message.guild.id);
            let levelUp = false;
            if (level.level < MAX_LEVEL) {
                level.count += 1;
                if (level.count >= EXP_PER_LEVEL * level.level) {
                    level.count = 0;
                    level.level += 1;
                    levelUp = true;
                }
            }
            if (channelId && levelUp) {
                const channel = client.channels.cache.get(channelId); 
                if (channel) {
                    if (level.level === MAX_LEVEL) {
                        channel.send(customMessage ? customMessage.replace('{user.name}', message.author.username).replace('{user}', `<@${message.author.id}>`).replace('{level}', level.level) : `おめでとうございます！<@${message.author.id}>さんのレベルが最大レベル**${level.level}**になりました！`);
                    } else {
                        channel.send(customMessage ? customMessage.replace('{user.name}', message.author.username).replace('{user}', `<@${message.author.id}>`).replace('{level}', level.level) : `<@${message.author.id}>さんのレベルが${level.level}に上がりました！`);
                    }
                }
            }
            levels.set(key, level); 
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};