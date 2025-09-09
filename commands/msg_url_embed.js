const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const msg_url_embed = new Keyv('sqlite://db.sqlite', { table: 'msgurlembed' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('msg-url-embed')
        .setDescription('メッセージのリンクが貼られた時、展開する機能を設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName('enable').setDescription('メッセージのリンクが貼られた時、展開する機能を有効化します'))
        .addSubcommand(command => command.setName('disable').setDescription('メッセージのリンクが貼られた時、展開する機能を無効にします。')),
        async execute(interaction) {

            const { options } = interaction;
            const sub = options.getSubcommand();
            const data = await msg_url_embed.get(interaction.guild.id);

            switch (sub) {
                case 'enable':
    
                if (data){
                    return await interaction.reply({ content: 'メッセージのリンクが貼られた時、展開する機能は既に有効化されています。', flags: MessageFlags.Ephemeral });
                } else {
    
                    await msg_url_embed.set(interaction.guild.id, true);
    
                    const embed = new EmbedBuilder()
                    .setAuthor({ name: '✅｜有効化しました' })
                    .setColor("Blurple")
                    .setDescription(`メッセージのリンクが貼られた時、展開する機能を有効化しました。`)
    
                  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
    
                break;
                case 'disable':
    
                if (!data) {
                    return await interaction.reply({ content: `メッセージのリンクが貼られた時、展開する機能は有効化されていません。`, flags: MessageFlags.Ephemeral })
                } else {
                    await msg_url_embed.delete(interaction.guild.id);
                    return await interaction.reply({ content: `メッセージのリンクが貼られた時、展開する機能を無効にしました。`, flags: MessageFlags.Ephemeral })
                }
            }
        }
    }