const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const groups = new Keyv('sqlite://db.sqlite', { table: 'levelgroups' });

const MAX_LEVEL = 99;

function calculateLevelFromXP(totalXP) {
    let level = 1;
    while (level < MAX_LEVEL) {
        const expToNext = Math.floor(5 * Math.pow(level, 1.5));
        if (totalXP < expToNext) break;
        totalXP -= expToNext;
        level++;
    }
    return { level, currentXP: totalXP };
}

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('level_ranking')
        .setDescription('実行したサーバーのレベルランキングを表示します')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(option =>
            option.setName('top')
                .setDescription('表示する上位人数を選択します')
                .setRequired(false)
                .addChoices(
                    { name: 'TOP 10', value: 10 },
                    { name: 'TOP 20', value: 20 }
                )
        ),

    async execute(interaction) {
        const isEnabled = await levelsettings.get(interaction.guild.id);
        if (!isEnabled) {
            return interaction.reply({ content: 'このサーバーではレベル機能が有効になっていません。', flags: MessageFlags.Ephemeral });
        }

        const topN = interaction.options.getInteger('top') || 10;
        await interaction.deferReply();

        const members = await interaction.guild.members.fetch();

        // 元データ取得
        const rawData = await Promise.all(members.map(async member => {
            if (member.user.bot) return null;
            const key = `${member.id}-${interaction.guild.id}`;
            const level = (await levels.get(key)) || { count: 0, level: 1 };
            let totalExp = 0;
            for (let l = 1; l < level.level; l++) totalExp += Math.floor(5 * Math.pow(l, 1.5));
            totalExp += level.count;
            return { user: member.user, totalExp };
        }));

        const rawMap = new Map();
        rawData.forEach(d => { if (d) rawMap.set(d.user.id, d); });

        // グループ取得
        const groupList = [];
        for await (const [groupId, data] of groups.iterator()) {
            if (data.guildId === interaction.guild.id) groupList.push({ id: groupId, ...data });
        }

        const mergedData = [];
        const usedUsers = new Set();

        // グループ単位でまとめる（XPある場合はsub表示不要）
        for (const group of groupList) {
            let totalExp = 0;
            let detailParts = [];
            let presentUsers = [];
            for (const uid of group.users) {
                const memberData = rawMap.get(uid);
                if (memberData) {
                    totalExp += memberData.totalExp;
                    detailParts.push(memberData.totalExp);
                    presentUsers.push(uid);
                }
            }
            if (presentUsers.length === 0) continue;
            presentUsers.forEach(uid => usedUsers.add(uid));

            const result = calculateLevelFromXP(totalExp);
            const xpText = detailParts.length > 1 ? detailParts.join(' + ') : '';

            // XP表示がある場合はSub表示しない
            const nameDisplay = xpText ? `${group.name}` : `${group.name} (Sub: ${presentUsers.slice(1).map(id => `<@${id}>`).join(', ')})`;

            mergedData.push({
                name: nameDisplay,
                totalExp,
                level: result.level,
                xpText,
                userIds: presentUsers
            });
        }

        // 単体ユーザー処理（グループに含まれないユーザーのみ）
        for (const data of rawData) {
            if (!data || usedUsers.has(data.user.id)) continue;
            const result = calculateLevelFromXP(data.totalExp);
            mergedData.push({
                name: `<@${data.user.id}>`,
                totalExp: data.totalExp,
                level: result.level,
                xpText: `${data.totalExp}`,
                userIds: [data.user.id]
            });
        }

        // ソート
        mergedData.sort((a, b) => b.totalExp - a.totalExp);

        // ランキング生成
        const ranking = [];
        const rankEmojis = ['🥇', '🥈', '🥉'];
        let prevExp = null;
        let rank = 1;
        mergedData.forEach((data, index) => {
            if (prevExp !== null && prevExp !== data.totalExp) rank = index + 1;
            prevExp = data.totalExp;
            const rankDisplay = rank <= 3 ? rankEmojis[rank - 1] : `#${rank}`;
            const isUser = data.userIds.includes(interaction.user.id);
            const xpSuffix = data.xpText ? ` (XP:${data.xpText})` : '';
            ranking.push(isUser ? `**${rankDisplay} I ${data.name} : Lv.${data.level}${xpSuffix}**` : `${rankDisplay} I ${data.name} : Lv.${data.level}${xpSuffix}`);
        });

        const commandUserIndex = mergedData.findIndex(d => d.userIds.includes(interaction.user.id));
        const commandUserRank = commandUserIndex + 1;
        const commandUserData = mergedData[commandUserIndex];

        let description = ranking.length === 0 ? 'ランキングデータが見つかりません。' : ranking.slice(0, topN).join('\n');
        if (commandUserRank > topN && commandUserData) {
            const xpSuffix = commandUserData.xpText ? ` (XP:${commandUserData.xpText})` : '';
            description += `\n…\n**#${commandUserRank} I ${commandUserData.name} : Lv.${commandUserData.level}${xpSuffix}**`;
        }

        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle('💬 SCORE RANKING (TEXT)')
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png' })
            .setDescription(description)
            .setTimestamp()
            .setFooter({ iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png', text: `${interaction.user.username}さんがコマンドを実行しました` });

        await interaction.editReply({ embeds: [embed] });
    },
};