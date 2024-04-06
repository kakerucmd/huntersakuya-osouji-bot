const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highlow')
        .setDescription('ハイ＆ローを開始します')
        .addIntegerOption(option => 
            option.setName('rounds')
                .setDescription('何回するか')
                .setRequired(true)),
    async execute(interaction) {
        const rounds = interaction.options.getInteger('rounds');
        if (rounds <= 0 || rounds > 10) {
            await interaction.reply({ content: `有効な数（1～10）を入力してください。`, ephemeral: true });
            return;
        }

        let count = 0;
        let correctCount = 0;
        let number = Math.floor(Math.random() * 10) + 1;

        const highButton = new ButtonBuilder()
            .setCustomId('high')
            .setLabel('High')
            .setStyle('Primary');

        const lowButton = new ButtonBuilder()
            .setCustomId('low')
            .setLabel('Low')
            .setStyle('Primary');

        const drawButton = new ButtonBuilder()
            .setCustomId('draw')
            .setLabel('Draw')
            .setStyle('Primary');

        const row = new ActionRowBuilder()
            .addComponents(highButton, lowButton, drawButton);

        await interaction.deferReply();
        await interaction.editReply({ content: `${interaction.user.toString()}\nハイ＆ローを開始します。\n現在の数は${number}です。次の数は現在の数より高い(high)と思いますか、それとも低い(low)と思いますか？\n または同じ(draw)と思いますか？`, components: [row] });

        const filter = i => {
            return (i.customId === 'high' || i.customId === 'low' || i.customId === 'draw') && i.user.id === interaction.user.id;
        };
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            const guess = i.customId;
            const nextNumber = Math.floor(Math.random() * 10) + 1;

            if ((guess === 'high' && nextNumber > number) || (guess === 'low' && nextNumber < number) || (guess === 'draw' && nextNumber === number)) {
                correctCount++;
                await i.update({ content: `${interaction.user.toString()}\n次の数は${nextNumber}でした。正解です！\n現在の数は${nextNumber}です。次の数は現在の数より高い(high)と思いますか、それとも低い(low)と思いますか？\n または同じ(draw)と思いますか？`, components: [row] });
            } else {
                await i.update({ content: `${interaction.user.toString()}\n次の数は${nextNumber}でした。不正解です。\n現在の数は${nextNumber}です。次の数は現在の数より高い(high)と思いますか、それとも低い(low)と思いますか？\n または同じ(draw)と思いますか？`, components: [row] });
            }

            count++;
            number = nextNumber;

            if (count >= rounds) {
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0 || count < rounds) {
                interaction.editReply({ content: `入力がタイムアウトしました`, components: [] });
            } else {
                interaction.editReply({ content: `${interaction.user.toString()}さんの${rounds}回のハイ＆ローが終了しました。${correctCount}回正解しました。`, components: [] });
            }
        });
    },
};