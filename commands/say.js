const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('入力したメッセージをお掃除上方修正しろbotに喋らせます')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('メッセージを入力')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const user = interaction.user; 

        console.log(`User: ${user.username} (${user.id}) requested to send message: ${message}`);

        const containsToken = /([a-zA-Z0-9-_]{24}\.[a-zA-Z0-9-_]{6}\.[a-zA-Z0-9-_]{27})|mfa\.[a-z0-9_-]{20,}/i.test(message);

        if (containsToken) {
            console.log(`Blocked message from ${user.username} (${user.id}) due to token-like content.`);
            await interaction.reply({ content: 'Token類似文字列を含むメッセージは送信できません。', flags: MessageFlags.Ephemeral });
            return;
        }
        
        console.log(`Sending message to channel from ${user.username} (${user.id})...`);
        await interaction.reply({ content: 'メッセージを送信しました。\n※botのホストサーバーにログが残ります。', flags: MessageFlags.Ephemeral });
        await interaction.channel.send({ content: message });
    },
};
