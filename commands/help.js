const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pagination = require('../functions/pagination')

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('ヘルプを表示します'),
    async execute(interaction) {

        const embeds = [];
        for (var i = 0; i < 4; i++){
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
                        name: '**/raitai_enemy_l1**',
                        value:'擂台のエネミー(L1)を表示します。(現在無効化中)'
                    },
                    {
                        name: '**/5000choyen**',
                        value:'5000兆円ジェネレータ―を使用します。'
                    },
                    {
                        name: '**/avatar**',
                        value:'指定したユーザーのアバターを表示します。'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 1) {
                embed.setDescription('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/omikuji**',
                        value:'指定した回数おみくじをします。'
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
                        value:'指定したユーザーのレベルを表示します。'
                    },
                    {
                        name: '**/level_ranking**',
                        value:'サーバー全体でのレベルのランキングを表示します'
                    },
                    {
                        name: '**/timeout**',
                        value:'指定したユーザーをタイムアウトします。'
                    },
                    {
                        name: '**/kick**',
                        value:'指定したユーザーをキックします。'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 2) {
                embed.setDescription('コマンド(/)')
                embed.setFields(
                    {
                        name: '**/ban**',
                        value:'指定したユーザーをBANします。'
                    },
                    {
                        name: '**/getallsettings**',
                        value:'実行したサーバー内のこのbotの設定を表示します。'
                    },
                    {
                        name: '**/createverifypanel**',
                        value:'指定した形式の認証パネルを作成します。'
                    },
                    {
                        name: '**/createrolepanel**',
                        value:'ロールを10個まで指定できるロールパネルを作成します。'
                    },
                    {
                        name: '**/osoujireply**',
                        value:'「お掃除」等の単語に対して反応する機能を設定します。\n(setupで有効化、disableで無効化)'
                    },
                    {
                        name: '**/settogglelevel**',
                        value:'レベル機能の設定を行います。'
                    },
                    {
                        name: '**/setlevel**',
                        value:'指定したユーザーのレベルを設定します。'
                    },
                    {
                        name: '**/settoggleleave**',
                        value:'即抜けの通知設定を行います。'
                    },
                    {
                        name: '**/setglobalchat**',
                        value:'指定したチャンネルでグローバルチャットを有効にするか設定します。'
                    },
                    {
                        name: '**/automod**',
                        value:'Automodを設定します。\n(詳細はドキュメントをお読みください)'
                    },
                )
                embed.setColor('Blurple');
            } else if (i === 3) {
                embed.setTitle('コマンド(/)、概要')
                embed.setThumbnail('https://cdn.discordapp.com/avatars/1175248665972060160/ef2f2557ae2989b7635cd7ead0702240.webp?size=1024&format=webp&width=0&height=320')
                embed.setFields(
                    {
                        name: '**/ticket**',
                        value:'チケット機能を使用します。\n(setupで設定、sendでチケットパネルを送信、removeで設定を削除)'
                    },
                    {
                        name: '**/welcome**',
                        value:'ウェルカムメッセージ機能を使用します。\n(setupで有効化、disableで無効化)'
                    },
                    {
                        name: '**/joinleavelogs**',
                        value:'入退室ログ機能を使用します。\n(setupで有効化、disableで無効化)'
                    },
                    {
                        name: '**～～～～～～～～～～**',
                        value:'下記からbotの概要'
                    },
                    {
                        name: '**bot製作者**',
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
                        value:'https://kakerucmd.github.io/huntersakuya-osouji-bot_Pages.github.io/'
                    },
                )
                embed.setColor('Blurple');
            }
            embeds.push(embed);
        }        

        await pagination(interaction, embeds);
    },
};
