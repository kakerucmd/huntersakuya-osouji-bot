const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raitai_enemy_l1')
        .setDescription('擂台のエネミー(L1)を表示します'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('現在このコマンドは無効化されています。')

        await interaction.reply({ embeds: [embed] , ephemeral: true });
    },
};