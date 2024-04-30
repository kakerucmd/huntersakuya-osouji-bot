const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('入力したメッセージをお掃除上方修正しろbotに喋らせます'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('現在このコマンドは無効化されています。')

        await interaction.reply({ embeds: [embed] , ephemeral: true });
    },
};