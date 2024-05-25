const { SlashCommandBuilder } = require('discord.js');

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
        await interaction.reply({ content: 'おみくじは一度に最大10回まで引けます。', ephemeral: true });
        return;
      }
      
      if(num <= 0) {
        await interaction.reply({ content: '1以上の値を入力してください', ephemeral: true });
        return;
      }

      let probabilities = [
        { result: "大吉", weight: 5 },
        { result: "中吉", weight: 15 },
        { result: "小吉", weight: 15 },
        { result: "末吉", weight: 10 },
        { result: "凶", weight: 10 },
        { result: "大凶", weight: 5 },
        { result: "諭吉", weight: 10 },
        { result: "不吉", weight: 5 },
        { result: "たぬ吉", weight: 10 },
        { result: "ファミ吉", weight: 5 },
        { result: "中古", weight: 10 }
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
