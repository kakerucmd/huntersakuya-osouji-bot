const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('指定したワードでルーレットを回します')
        .addStringOption(option =>
            option.setName('words')
                .setDescription('ルーレットで使用するワードをカンマ(,)で区切って入力してください')
                .setRequired(true)),
	async execute(interaction) {
        const words = interaction.options.getString('words').split(',');
        let message = await interaction.reply(`ルーレットを回します... 使用するワードは ${words.join('、\n')} です。`, { fetchReply: true });

        const result = words[Math.floor(Math.random() * words.length)];
        let count = 0;
        let i = 0;
        const intervalId = setInterval(async () => {
            if (words[i] === result) {
                count++;
            }
            if (count === 2) {
                clearInterval(intervalId);
                await interaction.editReply(`ルーレットの結果は... ${result} です！`);
            } else {
                await interaction.editReply(`現在の候補は... ${words[i]} です！`);
                i = (i + 1) % words.length;
            }
        }, 1000);
    },
};