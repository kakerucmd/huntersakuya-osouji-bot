const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'osouji_first_button') {
          try {
            const embed = new EmbedBuilder()
                .setTitle('1ページ目')
                .setColor('#0099ff')
                .setDescription('**アプリケーションコマンド(/)**' +
                                '\n\n' +
                                '**/huntersakuya**：お掃除上方修正しろと返信' +
                                '\n\n' +
                                '**/osouji**：お掃除上方修正しろと返信' +
                                '\n\n' +
                                '**/osouji_image**：お掃除上方修正しろの画像を返信' +
                                '\n\n' +
                                '**/ping**：通信速度を測定' +
                                '\n\n' +
                                '**/earthquake**：地震情報を表示' +
                                '\n\n' +
                                '**/avatar**：指定したユーザーのアイコンを表示' +
                                '\n\n' +
                                '**/omikuji**：おみくじをします' +
                                '\n\n' +
                                '**/kaso**：過疎化していますの画像を表示します'+
                                '\n\n' +
                                '**/say**：入力したメッセージをお掃除上方修正しろbotに喋らせます');
      
            await interaction.update({ embeds: [embed] });
          } catch (err) {
            return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
          }
        }
      
        if (interaction.customId === 'osouji_second_button') {
          try {
            const embed = new EmbedBuilder()
                .setTitle('2ページ目')
                .setColor('#0099ff')
                .setDescription('**アプリケーションコマンド(/)**' +
                                '\n\n' +
                                '**/raitai_enemy_simulator**：擂台予報をするボタンを出します' +
                                '\n\n' +
                                '**/support**：サポートサーバーのリンクを貼ります' +
                                '\n\n' +
                                '**/help**：今表示してるものです' +
                                '\n\n' +
                                '**/level**：現在のレベルを表示します' +
                                '\n\n' +
                                '**/level_ranking**：サーバー内のレベルランキングを表示します' +
                                '\n\n' +
                                '**/shorturl**：短縮URLを生成します' +
                                '\n\n' +
                                '**/5000choyen**：5000兆円ジェネレーターを使用します' +
                                '\n\n' +
                                '**/quiz**：クイズをします。(詳しくはサポートサーバー)' +
                                '\n\n'+
                                '**/roulette：**ルーレットをします。(詳しくはサポートサーバー)');
            await interaction.update({ embeds: [embed] });
          } catch (err) {
            return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
          }
        }
      
        if (interaction.customId === 'osouji_third_button') {
          try {
          const embed = new EmbedBuilder()
              .setTitle('3ページ目')
              .setColor('#0099ff')
              .setDescription('**アプリケーションコマンド(指定の権限が必要)**' +
                              '\n\n'+
                              '**/timeout**：指定したユーザーをタイムアウトします(ユーザーをタイムアウトする権限が必要)' +
                              '\n\n'+
                              '**/kick**：指定したユーザーをKickします(ユーザーをKickする権限が必要)' +
                              '\n\n' +
                              '**/ban**：指定したユーザーをBanします(ユーザーをBanする権限が必要)' +
                              '\n\n'+
                              '**/createrolepanel**：ロールパネルを作成します(管理者権限が必要)'+
                              '\n\n'+
                              '**/createverifypanel**：指定した形式の認証パネルを作成します(管理者権限が必要)'+
                              '\n\n'+
                              '**/setlevel**：指定したユーザーのレベルを指定します(管理者権限が必要)'+
                              '\n\n' +
                              '**/settogglelevel**：レベル機能を有効化するか設定します(管理者権限が必要)'+
                              '\n\n' +
                              '**/settoggleleave**：即抜けの通知を有効化するか設定します(管理者権限が必要)' +
                              '\n\n' +
                              '**/automod**：automodを設定します(管理者権限が必要)' +
                              '\n' +
                              '「flagged-words」「keyword」「mention-spam」「spam-messages」' );
          await interaction.update({ embeds: [embed] });
          } catch (err) {
            return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
          }
        }
      
        if (interaction.customId === 'osouji_home_button') {
          try {
          const embed = new EmbedBuilder()
              .setTitle('お掃除上方修正しろbotVer3.0のヘルプ')
              .setColor('#0099ff')
              .setDescription('以下のボタンを押してヘルプを表示');
            await interaction.update({ embeds: [embed] });
          } catch (err) {
            return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
        }
        }
      
        if (interaction.customId === 'osouji_delete_button') {
          let message;
          try {
            message = await interaction.channel.messages.fetch(interaction.message.id);
          } catch (err) {
            console.error(`メッセージの取得に失敗しました: ${err}`);
            return interaction.reply({ content: 'メッセージの取得に失敗しました。', ephemeral: true });
          }
      
          try {
            await message.delete();
          } catch (err) {
            console.error(`メッセージの削除に失敗しました: ${err}`);
            return interaction.reply({ content: 'メッセージの削除に失敗しました。', ephemeral: true });
          }
      
          await interaction.reply({ content: 'ヘルプを削除しました。', ephemeral: true });
        }
	},
};