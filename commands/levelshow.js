const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 111;
const EXP_PER_LEVEL = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level_show')
        .setDescription('指定したユーザーのレベルを表示します')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを確認したいユーザー(指定しなかったら自身のレベルを表示します)')
                .setRequired(false)),
    async execute(interaction) {
        const isEnabled = await settings.get(interaction.guild.id);
        if (!isEnabled) { 
            return interaction.reply({ content: `このサーバーではレベル機能が有効化されていません。`, ephemeral: true });
        } 
        const user = interaction.options.getUser('user') || interaction.user;
        const key = `${user.id}-${interaction.guild.id}`; 
        const level = (await levels.get(key)) || { count: 0, level: 1 };

        const percentage = Math.round((level.count / (EXP_PER_LEVEL * level.level)) * 100);
        const progressText = `**${level.count}/${EXP_PER_LEVEL * level.level}XP（${percentage}%）**`;

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setThumbnail(`${user.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`)
            .setAuthor({
                name: `${interaction.guild.name}`,
                iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
            })    
            .setTimestamp()

        if (level.level === MAX_LEVEL) {
            embed.setDescription(`<@${user.id}>さんのレベルは${level.level}(最大レベル)です。\n**1110XP（MAX）**\n🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`);
        } else {
            const progress = Math.round((level.count / (EXP_PER_LEVEL * level.level)) * 10);
            const progressBar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

            embed.setDescription(`<@${user.id}>さんのレベルは${level.level}です。\n${progressText}\n${progressBar}`)
        }

        await interaction.reply({ embeds: [embed] });
    },
};