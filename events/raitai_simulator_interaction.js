const fs = require('node:fs');
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        try {
            if (!interaction.isButton()) return;
            if (interaction.customId === 'raitai_enemy_simulator') {
              let data;
              try {
                data = await fs.promises.readFile('./data.json', 'utf-8');
              } catch (err) {
                console.error(`ファイルの読み取りに失敗しました: ${err}`)
                return interaction.reply({ content: 'エラーが発生しました', ephemeral: true });
              }
        
              let jsonData;
              try {
                jsonData = JSON.parse(data);
              } catch (err) {
                console.error(`JSONの解析に失敗しました: ${err}`);
                return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
              }
        
              const content = [];
              const selectedElements = [];
        
              for (let wave = 1; wave <= 4; wave++) {
                const numElements = Math.floor(Math.random() * 3) + 1;
                const waveElements = [];
                for (let i = 0; i < numElements; i++) {
                  let randomIndex;
                  let randomElement;
                  do {
                    randomIndex = Math.floor(Math.random() * jsonData.length);
                    randomElement = jsonData[randomIndex];
                  } while (selectedElements.includes(randomElement));
                  selectedElements.push(randomElement);
                  waveElements.push(randomElement);
                }
                content.push(`**${wave}wave目**\n${waveElements.map(element => `${element.name} ${element.description}`).join('\n\n')}`);
              }
              const raitai_embed = new EmbedBuilder()
                .setTitle('明日の擂台予報')
                .setDescription(`実行者：<@${interaction.user.id}>\n\n` + content.join('\n\n'))
                .setColor("Blurple");
        
              await interaction.reply({
                embeds: [raitai_embed],
                components: [
                  new ActionRowBuilder()
                    .addComponents(
                      new ButtonBuilder()
                      .setCustomId('delete_raitai_embed')
                      .setLabel('擂台予報を削除')
                      .setStyle(ButtonStyle.Primary)
                      .setEmoji('\u{1F5D1}')
                    ),
                ],
              });
            }
        
            if (interaction.customId === 'delete_raitai_embed') {
              let message;
              try {
                message = await interaction.channel.messages.fetch(interaction.message.id);
              } catch (err) {
                console.error(`メッセージの取得に失敗しました: ${err}`);
                return interaction.reply({ content: 'メッセージの取得に失敗しました。', ephemeral: true });
              }
        
              if (message) {
                try {
                  await message.delete();
                } catch (err) {
                  return interaction.reply({ content: 'メッセージが存在しません。', ephemeral: true });
                }
              } else {
                return interaction.reply({ content: 'メッセージは既に削除されています。', ephemeral: true });
              }
        
              await interaction.reply({ content: '擂台予報の埋め込みを削除しました。', ephemeral: true });
            }
          } catch (err) {
            console.error(`エラーが発生しました: ${err}`);
            interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
          }
	},
};