const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 99;

function calculateTotalXP(level, currentXP) {
    let total = 0;

    for (let i = 1; i < level; i++) {
        total += Math.floor(5 * Math.pow(i, 1.5));
    }

    return total + currentXP;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level_show')
        .setDescription('指定したユーザーのレベルを表示します')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを確認したいユーザー(指定しなかったら自身のレベルを表示します)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const isEnabled = await settings.get(interaction.guild.id);
        if (!isEnabled) { 
            return interaction.reply({
                content: 'このサーバーではレベル機能が有効化されていません。',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user') || interaction.user;
        const key = `${user.id}-${interaction.guild.id}`; 
        const level = (await levels.get(key)) || { count: 0, level: 1 };

        const EXP_TO_NEXT = Math.floor(5 * Math.pow(level.level, 1.5));

        const totalXP = calculateTotalXP(level.level, level.count);

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);


        const embed = new EmbedBuilder()
        
            .setColor("Blurple")
            .setThumbnail(user.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png')
            .setTitle(member?.displayName ?? user.username)
            .setTimestamp();

        if (level.level === MAX_LEVEL) {
            embed.setDescription(
                `**Lv ${level.level} (MAX)\n (Total ${totalXP}XP)**\n` +
                `🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`
            );
        } else {
            const percentage = Math.round((level.count / EXP_TO_NEXT) * 100);
            const progressText =
                `XP ${level.count}/${EXP_TO_NEXT}(${percentage}%)`

            const progress = Math.round((level.count / EXP_TO_NEXT) * 10);
            const progressBar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

            embed.setDescription(
                `**Lv ${level.level} (Total ${totalXP}XP)\n${progressText}**\n` +
                `${progressBar}`
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};
