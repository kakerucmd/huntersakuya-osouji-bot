const { SlashCommandBuilder } = require('@discordjs/builders');

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
      let messageList = ["大吉","中吉", "小吉","末吉","凶","大凶","諭吉","不吉","たぬ吉"];
      let num = interaction.options.getInteger('num');
      if(num > 10) {
        await interaction.reply({ content: 'おみくじは10回まで引けます。', ephemeral: true });
        return;
      }
      let results = [];
      for(let i=0; i<num; i++){
        let result = `${i+1}回目：${messageList[Math.floor(Math.random()*messageList.length)]}`;
        results.push(result);
      }
      await interaction.reply(results.join('\n'));
    } catch (error) {
      console.error(`エラーが発生しました: ${error}`);
      await interaction.reply({ content: 'エラーが発生しました。後ほど再試行してください。', ephemeral: true });
    }
  },
};