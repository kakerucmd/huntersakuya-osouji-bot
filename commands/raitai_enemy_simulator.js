const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raitai_enemy_simulator')
        .setDescription('擂台予報をするボタンを送信します'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('擂台予報')
            .setDescription('以下のボタンを押して、擂台予報を行います。')
            .setColor("Blurple")

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('raitai_enemy_simulator')
                    .setLabel('擂台予報をする')
                    .setStyle(ButtonStyle.Primary),
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};