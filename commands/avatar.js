const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('指定したユーザーのアバターを表示します。')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('アバターを表示したいユーザーを選択してください。')
                .setRequired(false)),
    async execute(interaction) {
        try {

            let user = interaction.options.getUser('user');
            if (!user) user = interaction.user;

            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
            if (!avatarURL) throw new Error('AvatarURLを取得できませんでした。');

            const embed = new EmbedBuilder()
            .setAuthor({
                name: `${user.username}`,
                iconURL: `${user.displayAvatarURL()}`
              })  
            .setTitle('**AvatarURL**')
            .setColor("Blurple")
            .setImage(avatarURL)
            .setURL(avatarURL)
            .setFooter({
                iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }),
                text: `${interaction.user.username}さんがコマンドを実行しました`
            })

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
        }
    },
};