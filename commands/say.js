const { SlashCommandBuilder } = require('discord.js');

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

        const containsToken = /([a-zA-Z0-9-_]{24}\.[a-zA-Z0-9-_]{6}\.[a-zA-Z0-9-_]{27})|mfa\.[a-z0-9_-]{20,}/i.test(message);

        if (containsToken) {
            await interaction.reply({ content: 'Token類似文字列を含むメッセージは送信できません。', ephemeral: true });
            return;
        }

        await interaction.reply({ content: message });
    },
};
