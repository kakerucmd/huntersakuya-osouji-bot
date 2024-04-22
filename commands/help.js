const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('ヘルプを表示します'),
    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('お掃除上方修正しろbotVer3.0のヘルプ')
                .setColor('#0099ff')
                .setDescription('以下のボタンを押してヘルプを表示');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('osouji_first_button')
                        .setLabel('1p')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('osouji_second_button')
                        .setLabel('2p')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('osouji_third_button')
                        .setLabel('3p')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('osouji_home_button')
                        .setLabel('タイトル')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('osouji_delete_button')
                        .setStyle('Danger')
                        .setEmoji('\u{1F5D1}')
                );

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error(error);
            interaction.reply('エラーが発生しました：' + error.message);
        }
    },
};