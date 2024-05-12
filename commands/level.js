const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 111;
const EXP_PER_LEVEL = 10;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('指定したユーザーのレベルを表示します')
    .setDMPermission(false)
    .addUserOption(option => 
      option.setName('user')
      .setDescription('レベルを確認したいユーザー(指定しなかったら自身のレベルを表示します)')
      .setRequired(false)),
  async execute(interaction) {
      const isEnabled = await levelsettings.get(interaction.guild.id);
      if (!isEnabled) { 
        return interaction.reply({ content: `このサーバーではレベル機能が有効化されていません。`, ephemeral: true });
      } 
      const user = interaction.options.getUser('user') || interaction.user;
      const key = `${user.id}-${interaction.guild.id}`; 
      const level = (await levels.get(key)) || { count: 0, level: 1 };

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setThumbnail(`${user.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`)
        .setAuthor({
            name: `ギルド内XP`,
            iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
        })    
        .setTimestamp()

      if (level.level === MAX_LEVEL) {
        
        embed.setDescription(`<@${user.id}>さんのレベルは**${level.level}**(最大レベル)です。`)
      } else {
        const remainingExp = EXP_PER_LEVEL * level.level - level.count;
        const totalExp = EXP_PER_LEVEL * level.level;
        const progress = Math.round((level.count / totalExp) * 10);
        const progressBar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

        embed.setDescription(`<@${user.id}>さんのレベルは**${level.level}**です。\n次のレベルまで：**${remainingExp}**XP\n${progressBar}`)
      }

      await interaction.reply({ embeds: [embed] });
  },
};
