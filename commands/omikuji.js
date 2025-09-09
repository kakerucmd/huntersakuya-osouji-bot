const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji')
        .setDescription('おみくじを引きます')
        .addIntegerOption(option =>
            option.setName('num')
                .setDescription('おみくじを引く回数 (最大10回)')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            let num = interaction.options.getInteger('num');
            if(num > 10) {
                await interaction.reply({ content: 'おみくじは一度に最大10回まで引けます。', flags: MessageFlags.Ephemeral });
                return;
            }
            
            if(num <= 0) {
                await interaction.reply({ content: '1以上の値を入力してください', flags: MessageFlags.Ephemeral });
                return;
            }

            let probabilities = [
                { result: "大吉", weight: 10 },
                { result: "中吉", weight: 20 },
                { result: "小吉", weight: 20 },
                { result: "末吉", weight: 15 },
                { result: "凶", weight: 3 },
                { result: "大凶", weight: 2 },
                { result: "諭吉", weight: 5 },
                { result: "不吉", weight: 3 },
                { result: "たぬ吉", weight: 5 },
                { result: "ファミ吉", weight: 5 },
                { result: "チ吉キ", weight:5 },
                { result: "中古", weight: 5 },
                { result: "四凶", weight: 1 },
                { result: "帝凶平成大学", weight: 1 },
                { result: "凶和国", weight: 1 },
                { result: "吉田沙保吉", weight: 1 },
                { result: "獄門凶", weight: 2 },
                { result: "らっ凶", weight: 1 }
            ];

            function getOmikujiResult() {
                const sum = probabilities.reduce((acc, curr) => acc + curr.weight, 0);
                const rand = Math.random() * sum;
                let accum = 0;

                for (let i = 0; i < probabilities.length; i++) {
                    accum += probabilities[i].weight;
                    if (rand < accum) {
                        return probabilities[i].result;
                    }
                }
            }

            let results = [];
            for(let i = 0; i < num; i++){
                let result = `${i + 1}回目：${getOmikujiResult()}`;
                results.push(result);
            }
            
            await interaction.reply(results.join('\n'));
        } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
        }
    },
};