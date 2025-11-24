const { Events, Collection } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

// 連投管理
const meta = new Collection();

const MAX_LEVEL = 99;

const DUPLICATE_WINDOW_MS = 10000; // 10秒以内の同文連投はXPなし
const XP_COOLDOWN_MS = 2000;       // 2秒以内の連投はXPなし

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            if (message.author.bot) return;

            const isEnabled = await settings.get(message.guild.id);
            if (!isEnabled) return;

            const key = `${message.author.id}-${message.guild.id}`; 
            let level = (await levels.get(key)) || { count: 0, level: 1 };

            const channelId = await channels.get(message.guild.id);
            const customMessage = await messages.get(message.guild.id);

            // -------------------------------
            // 連投対策
            const now = Date.now();
            if (!meta.has(key)) {
                meta.set(key, { lastMsg: null, lastMsgAt: 0, lastXpAt: 0 });
            }
            const m = meta.get(key);

            // 重複メッセージを判定
            if (message.content.trim() === m.lastMsg && (now - m.lastMsgAt) < DUPLICATE_WINDOW_MS) {
                m.lastMsgAt = now;
                return; // XPなし
            }

            // クールダウン
            if ((now - m.lastXpAt) < XP_COOLDOWN_MS) {
                m.lastMsg = message.content.trim();
                m.lastMsgAt = now;
                return; // XPなし
            }

            // XP付与
            m.lastMsg = message.content.trim();
            m.lastMsgAt = now;
            m.lastXpAt = now;

            // -------------------------------
            // XP増加・レベルアップ
            let levelUp = false;
            if (level.level < MAX_LEVEL) {
                const EXP_TO_NEXT = Math.floor(5 * Math.pow(level.level, 1.5));
                level.count += 1; // 1メッセージで1XP

                if (level.count >= EXP_TO_NEXT) {
                    level.count = 0;
                    level.level += 1;
                    levelUp = true;
                }
            }
            if (channelId && levelUp) {
                const channel = client.channels.cache.get(channelId); 
                if (channel) {
                    const msg = customMessage 
                        ? customMessage.replace('{user.name}', message.author.username)
                                       .replace('{user.displayname}', message.member ? message.member.displayName : message.author.username)
                                       .replace('{user}', `<@${message.author.id}>`)
                                       .replace('{level}', level.level)
                        : level.level === MAX_LEVEL
                            ? `おめでとうございます！<@${message.author.id}>さんのレベルが最大レベル**${level.level}**になりました！`
                            : `<@${message.author.id}>さんのレベルが${level.level}に上がりました！`;

                    await channel.send(msg);
                }
            }

            await levels.set(key, level); 
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};