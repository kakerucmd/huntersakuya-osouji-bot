const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const EXP_PER_LEVEL = 10;
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
            const totalExp = ((level.level - 1) * (level.level) / 2) * EXP_PER_LEVEL + level.count;
            return { user: member.user, level, totalExp };
        }));
        const filteredLevelData = levelData.filter(data => data !== null);
        filteredLevelData.sort((a, b) => b.level.level - a.level.level || b.level.count - a.level.count);

        let rank = 1;
        let prevLevel = null;
        const ranking = filteredLevelData.map((data, index) => {
            if (prevLevel && (prevLevel.level !== data.level.level || prevLevel.count !== data.level.count)) {
                rank = index + 1;
            }
            prevLevel = data.level;
            const xpDisplay = data.level.level === MAX_LEVEL ? 'MAX' : data.totalExp;
            if (data.user.id === interaction.user.id) {
                return `****#${rank} I <@${data.user.id}>: レベル:${data.level.level} XP:${xpDisplay}****`; 
            } else {
                return `#${rank} I <@${data.user.id}>: レベル:${data.level.level} XP:${xpDisplay}`; 
            }
        });

        const commandUserData = levelData.find(data => data && data.user.id === interaction.user.id);
        const commandUserLevel = commandUserData ? commandUserData.level : { count: 0, level: 1 };
        const commandUserTotalExp = commandUserData ? commandUserData.totalExp : 0;

        const commandUserRank = ranking.findIndex(data => data.includes(interaction.user.id)) + 1;
        if (commandUserRank > 10 || commandUserRank === -1) {
            ranking.splice(9, 0, `****#${filteredLevelData.length + 1} I <@${interaction.user.id}>: レベル:${commandUserLevel.level} XP:${commandUserTotalExp}****`);
        }

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({
                name: `${interaction.guild.name}`,
                iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
            })  
            .setDescription(ranking.slice(0, 10).join('\n'))
            .setTimestamp()
            .setFooter({
                iconURL: `${interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png'}`,
                text: `${interaction.user.username}さんがコマンドを実行しました`
            });
        await interaction.editReply({ embeds: [embed] });
    },
};