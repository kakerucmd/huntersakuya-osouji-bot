const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

// レベルの上限を設定
const MAX_LEVEL = 111;
const EXP_PER_LEVEL = 10; // レベルごとに必要な経験値

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
          .setAuthor({
            name: `${user.username}`,
            iconURL: `${user.displayAvatarURL()}`
          })          
          .setTimestamp()

        // レベルが上限に達した場合のメッセージを変更
        if (level.level === MAX_LEVEL) {
          
          embed.setDescription(`<@${user.id}>さんのレベルは**${level.level}**(最大レベル)です。`)
        } else {
          const remainingExp = EXP_PER_LEVEL * level.level - level.count;

          embed.setDescription(`<@${user.id}>さんのレベルは**${level.level}**です。\n次のレベルまで：**${remainingExp}**XP`)
        }

        await interaction.reply({ embeds: [embed] });
    },
};