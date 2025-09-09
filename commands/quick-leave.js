const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');

const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leavechannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('quick-leave')
    .setDescription('即抜け通知機能の管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(command => command.setName('setup').setDescription('即抜け通知をセットアップします').addChannelOption(option => option.setName('channel').setDescription('即抜け通知を送信するチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('即抜け通知を無効にします')),
    async execute (interaction) {

        const  { options } = interaction;
        const sub = options.getSubcommand();
        const data = await toggleleave.get(interaction.guild.id);

        switch (sub) {
            case 'setup':

            if (data){
                return await interaction.reply({ content: '既に即抜け通知はセットアップされています。', flags: MessageFlags.Ephemeral });
            } else {
                const channel = options.getChannel('channel')

                await toggleleave.set(interaction.guild.id, true);
                if (channel) {
                    await leavechannel.set(interaction.guild.id, channel.id);
                }

                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜セットアップしました' })
                .setColor("Blurple")
                .setDescription(`通知するチャンネル:${channel}`)

              await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply({ content: `即抜け通知が有効化されていません。`, flags: MessageFlags.Ephemeral })
            } else {
                await toggleleave.delete(interaction.guild.id);
                await leavechannel.delete(interaction.guild.id)
                return await interaction.reply({ content: `即抜け通知を無効にしました。`, flags: MessageFlags.Ephemeral })
            }
        }
    }
}