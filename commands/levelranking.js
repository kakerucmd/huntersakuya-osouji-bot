const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 99;

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('level_ranking')
        .setDescription('実行したサーバーのレベルランキングを表示します')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const isEnabled = await levelsettings.get(interaction.guild.id);
        if (!isEnabled) { 
            return interaction.reply({ content: 'このサーバーではレベル機能が有効になっていません。', flags: MessageFlags.Ephemeral });
        } 

        await interaction.deferReply();

        const members = await interaction.guild.members.fetch();

        const levelData = await Promise.all(members.map(async member => {
            if (member.user.bot) return null;
            const key = `${member.id}-${interaction.guild.id}`; 
            const level = (await levels.get(key)) || { count: 0, level: 1 };

            let totalExp = 0;
            for (let l = 1; l < level.level; l++) {
                totalExp += Math.floor(5 * Math.pow(l, 1.5)); // レベルごとの必要XPを加算
            }
            totalExp += level.count; // 現在レベルの進捗を加算

            return { user: member.user, level, totalExp };
        }));

        const filteredLevelData = levelData.filter(data => data !== null);

        filteredLevelData.sort((a, b) => b.totalExp - a.totalExp);

        // ランキング作成
        const ranking = [];
        const rankEmojis = ['🥇', '🥈', '🥉'];
        let prevExp = null;
        let rank = 1;
        filteredLevelData.forEach((data, index) => {
            if (prevExp !== null && prevExp !== data.totalExp) {
                rank = index + 1;
            }
            prevExp = data.totalExp;

            const xpDisplay = data.level.level === MAX_LEVEL ? 'MAX' : data.totalExp;
            const rankDisplay = rank <= 3 ? rankEmojis[rank - 1] : `#${rank}`;
            if (data.user.id === interaction.user.id) {
                ranking.push(`**${rankDisplay} I <@${data.user.id}> : Lv.${data.level.level} TotalXP:${xpDisplay}**`);
            } else {
                ranking.push(`${rankDisplay} I <@${data.user.id}> : Lv.${data.level.level} TotalXP:${xpDisplay}`);
            }
        });

        // 実行者がTOP10にいない場合は表示
        const commandUserData = levelData.find(data => data && data.user.id === interaction.user.id);
        const commandUserTotalExp = commandUserData ? commandUserData.totalExp : 0;
        const commandUserLevel = commandUserData ? commandUserData.level : { count: 0, level: 1 };
        const commandUserRank = ranking.findIndex(data => data.includes(interaction.user.id)) + 1;
        if (commandUserRank > 10 || commandUserRank === 0) {
            ranking.splice(9, 0, `**#${filteredLevelData.length} I <@${interaction.user.id}>: Lv.${commandUserLevel.level} TotalXP:${commandUserTotalExp}**`);
        }

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({
                name: `${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'
            })  
            .setDescription(ranking.slice(0, 10).join('\n'))
            .setTimestamp()
            .setFooter({
                iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
                text: `${interaction.user.username}さんがコマンドを実行しました`
            });

        await interaction.editReply({ embeds: [embed] });
    },
};