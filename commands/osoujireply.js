const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('osoujireply')
        .setDescription('「お掃除」「上方修正」の単語に対して反応する機能を設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName('enable').setDescription('「お掃除」「上方修正」の単語に対して反応する機能を有効にします'))
        .addSubcommand(command => command.setName('disable').setDescription('「お掃除」「上方修正」の単語に対して反応する機能を無効にします')),
        async execute(interaction) {

            const { options } = interaction;
            const sub = options.getSubcommand();
            const data = await osouzireply.get(interaction.guild.id);

            switch (sub) {
                case 'enable':
    
                if (data){
                    return await interaction.reply({ content: '「お掃除」「上方修正」の単語に対して反応する機能は既に有効化されています。', flags: MessageFlags.Ephemeral });
                } else {
    
                    await osouzireply.set(interaction.guild.id, true);
    
                    const embed = new EmbedBuilder()
                    .setAuthor({ name: '✅｜有効化しました' })
                    .setColor("Blurple")
                    .setDescription(`「お掃除」「上方修正」の単語に対して反応する機能を有効化しました`)
    
                  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
    
                break;
                case 'disable':
    
                if (!data) {
                    return await interaction.reply({ content: `「お掃除」「上方修正」の単語に対して反応する機能が有効化されていません。`, flags: MessageFlags.Ephemeral })
                } else {
                    await osouzireply.delete(interaction.guild.id);
                    return await interaction.reply({ content: `「お掃除」「上方修正」の単語に対して反応する機能を無効にしました。`, flags: MessageFlags.Ephemeral })
                }
            }
        }
    }