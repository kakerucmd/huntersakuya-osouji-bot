const { SlashCommandBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });

const MAX_LEVEL = 99;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlevel')
        .setDescription('指定したユーザーのレベルを設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを設定するユーザー')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('設定するレベル')
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const user = interaction.options.getUser('user');
            let level = interaction.options.getInteger('level');
            const key = `${user.id}-${interaction.guild.id}`; 

            if (level > MAX_LEVEL) {
                level = MAX_LEVEL;
            }

            await levels.set(key, { count: 0, level: level });

            if (level === MAX_LEVEL) {
                return interaction.editReply(`<@${user.id}>さんのレベルが${level}(最大レベル)に設定されました。`);
            } else {
                return interaction.editReply(`<@${user.id}>さんのレベルが${level}に設定されました。`);
            }
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};
