const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pagination = require('../functions/pagination')

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('ヘルプを表示します'),
    async execute(interaction) {

        const botAvatar = interaction.client.user.displayAvatarURL({ format: 'webp', size: 1024 });

        const embeds = [];
        for (var i = 0; i < 5; i++){
            const embed = new EmbedBuilder();
            if (i === 0) {
                embed.setDescription('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/huntersakuya**',
                        value:'「お掃除上方修正しろ」と送信します。'
                    },
                    {
                        name: '**/osouji**',
                        value:'「お掃除上方修正しろ」と送信します。'
                    },
                    {
                        name: '**/osouji_image**',
                        value:'5000兆円画像の「お掃除上方修正しろ」を送信します'
                    },
                    {
                        name: '**/ping**',
                        value:'botの反応速度を計測します。'
                    },
                    {
                        name: '**/kaso**',
                        value:'過疎化注意の画像を埋め込みを使用して送信します。'
                    },
                    {
                        name: '**/help**',
                        value:'今表示しているものです。'
                    },
                    {
                        name: '**/raitai_enemy_simulator**',
                        value:'擂台予報を送信するボタンを送信します。'
                    },
                    {
                        name: '**/5000choyen**',
                        value:'5000兆円ジェネレータ―を使用します。'
                    },
                    {
                        name: '**/avatar**',
                        value:'指定したユーザーのアバターを表示します。'
                    },
                    {
                        name: '**/omikuji**',
                        value:'指定した回数おみくじをします。'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 1) {
                embed.setDescription('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/bulkdelete**',
                        value:'指定したユーザーのメッセージを一括削除します。'
                    },
                    {
                        name: '**/quiz**',
                        value:'タイトル、答え、制限時間を入力するとクイズができます。'
                    },
                    {
                        name: '**/say**',
                        value:'入力されたメッセージをbotが送信します。'
                    },
                    {
                        name: '**/shorturl**',
                        value:'`https://` から始まるURLを短縮します。'
                    },
                    {
                        name: '**/roulette**',
                        value:'カンマで区切って入力された単語でルーレットをします。'
                    },
                    {
                        name: '**/highlow**',
                        value:'指定した回数ハイ&ローを行います。'
                    },
                    {
                        name: '**/level**',
                        value:'レベル機能を設定します。\n(setupで設定、configで設定を変更、disableで設定を削除し無効化)'
                    },
                    {
                        name: '**/level_show**',
                        value:'指定したユーザーのレベルを表示します。'
                    },
                    {
                        name: '**/level_card**',
                        value:'指定したユーザーのレベルを画像+埋め込みで表示します。'
                    },
                    {
                        name: '**/level_ranking**',
                        value:'サーバー全体でのレベルのランキングを表示します。'
                    },
                    {
                        name: '**/setlevel**',
                        value:'指定したユーザーのレベルを設定します。'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 2) {
                embed.setDescription('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/timeout**',
                        value:'指定したユーザーをタイムアウトします。'
                    },
                    {
                        name: '**/kick**',
                        value:'指定したユーザーをキックします。'
                    },
                    {
                        name: '**/ban**',
                        value:'指定したユーザーをBANします。'
                    },
                    {
                        name: '**/server_settings**',
                        value:'実行したサーバーのこのbotの設定を表示します。'
                    },
                    {
                        name: '**/automod**',
                        value:'Automodを設定します。\n(詳細は[ドキュメント](https://kakerucmd.github.io/huntersakuya_osouji-bot/document.html)をお読みください)'
                    },
                    {
                        name: '**/reaction-role**',
                        value:'ロールを10個まで指定できるリアクションロールパネルを作成します。'
                    },
                    {
                        name: '**/button-role**',
                        value:'ロールを10個まで指定できるロールパネルを作成します。'
                    },
                    {
                        name: '**/verifypanel**',
                        value:'指定した形式の認証パネルを作成します。'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 3) {
                embed.setTitle('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/osoujireply**',
                        value:'「お掃除」等の単語に対して反応する機能を設定します。\n(enableで有効化、disableで無効化)'
                    },
                    {
                        name: '**/globalchat**',
                        value:'グローバルチャットを設定します。\n(enableで有効化、disableで無効化)'
                    },
                    {
                        name: '**/ticket**',
                        value:'チケット機能を使用します。\n(setupで設定、sendでチケットパネルを送信、removeで設定を削除)'
                    },
                    {
                        name: '**/welcome**',
                        value:'ウェルカムメッセージ機能を使用します。\n(setupで設定、disableで無効化)'
                    },
                    {
                        name: '**/msg-url-embed**',
                        value:'メッセージのリンクが貼られた時、展開する機能を使用します。\n(enableで有効化、disableで無効化)'
                    },
                    {
                        name: '**/joinleavelogs**',
                        value:'入退室ログ機能を使用します。\n(setupで設定、disableで無効化)'
                    },
                    {
                        name: '**/quick-leave**',
                        value:'即抜け通知機能を使用します。\n(setupで設定、disableで無効化)'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 4) {
                embed.setTitle('Botの概要')
                embed.setThumbnail(botAvatar)
                embed.setFields(
                    {
                        name: '**製作者**',
                        value:'・<@1090951958107521107>'
                    },
                    {
                        name: '**サポートサーバー**',
                        value:'https://discord.gg/dE3JpBXjnx'
                    },
                    {
                        name: '**招待はこちらから**',
                        value:'https://discord.com/oauth2/authorize?client_id=1175248665972060160&permissions=8&scope=applications.commands%20bot'
                    },
                    {
                        name: '**Official Site**',
                        value:'https://kakerucmd.github.io/huntersakuya_osouji-bot/'
                    },
                    {
                        name: '**利用規約**',
                        value:'https://kakerucmd.github.io/huntersakuya_osouji-bot/TermOfUse.html'
                    },
                    {
                        name: '**プライバシーポリシー**',
                        value:'https://kakerucmd.github.io/huntersakuya_osouji-bot/policy.html'
                    },
                )
                embed.setColor('Blurple');
            }
            embeds.push(embed);
        }        

        await pagination(interaction, embeds);
    },
};