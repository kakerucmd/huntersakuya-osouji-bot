const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) {
            console.error(`${interaction.commandName} が見つかりません。`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
        }
	},
};