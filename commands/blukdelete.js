const { SlashCommandBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bulkdelete')
        .setDescription('指定したユーザーのメッセージを削除します')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => 
            option.setName('user')
                  .setDescription('メッセージを削除するユーザー')
                  .setRequired(true)),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const user = interaction.options.getUser('user');
            const twoWeeksAgo = Date.now() - 1209600000;
            const limit = 100;

            const messages = await interaction.channel.messages.fetch({ limit: limit });
            const filtered = messages.filter(message => message.author.id === user.id && message.createdTimestamp > twoWeeksAgo);

            interaction.channel.bulkDelete(filtered)
            .then(deletedMessages => interaction.followUp({ content: `${deletedMessages.size}件のメッセージが削除されました。` }))
            .catch(error => interaction.followUp({ content: `エラーが発生しました。` }));

        } catch (error) {
            console.error(error);
        }
    },
};