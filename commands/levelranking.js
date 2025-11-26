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

        const levelData = await Promise.all(members.map(async member => {
            if (member.user.bot) return null;
            const key = `${member.id}-${interaction.guild.id}`; 
            const level = (await levels.get(key)) || { count: 0, level: 1 };

            let totalExp = 0;
            for (let l = 1; l < level.level; l++) {
                totalExp += Math.floor(5 * Math.pow(l, 1.5));
            }
            totalExp += level.count;

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
            const isUser = data.user.id === interaction.user.id;

            ranking.push(
                isUser
                    ? `**${rankDisplay} I <@${data.user.id}> : Lv.${data.level.level} (XP:${xpDisplay})**`
                    : `${rankDisplay} I <@${data.user.id}> : Lv.${data.level.level} (XP:${xpDisplay})`
            );
        });

        const commandUserRank = filteredLevelData.findIndex(data => data.user.id === interaction.user.id) + 1;

        const commandUserData = filteredLevelData.find(data => data.user.id === interaction.user.id);
        const commandUserTotalExp = commandUserData ? commandUserData.totalExp : 0;
        const commandUserLevel = commandUserData ? commandUserData.level : { count: 0, level: 1 };

        let description = '';
        if (ranking.length === 0) {
            description = 'ランキングデータが見つかりません。';
        } else {
            description = ranking.slice(0, topN).join('\n');
            if (commandUserRank > topN) {
                description += `\n…\n**#${commandUserRank} I <@${interaction.user.id}> : Lv.${commandUserLevel.level} (XP:${commandUserTotalExp})**`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle('💬 SCORE RANKING (TEXT)')
            .setAuthor({
                name: `${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'
            })  
            .setDescription(description)
            .setTimestamp()
            .setFooter({
                iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
                text: `${interaction.user.username}さんがコマンドを実行しました`
            });

        await interaction.editReply({ embeds: [embed] });
    },
};