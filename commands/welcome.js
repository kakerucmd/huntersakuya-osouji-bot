const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const welcome = new Keyv('sqlite://db.sqlite', { table: 'welcome' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('入出メッセージ機能の管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(command => command.setName('setup').setDescription('入出メッセージ機能をセットアップします').addChannelOption(option => option.setName('channel').setDescription('ウェルカムメッセージを送信するチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(option => option.setName('message').setDescription('送信するメッセージ').setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('入出メッセージ機能を無効にします')),
    async execute (interaction) {

        const  { options } = interaction;
        const sub = options.getSubcommand();
        const data = await welcome.get(interaction.guild.id);

        switch (sub) {
            case 'setup':

            if (data){
                return await interaction.reply({ content: '既に入出メッセージ機能はセットアップされています。', flags: MessageFlags.Ephemeral });
            } else {
                const channel = options.getChannel('channel')
                const message = options.getString('message')

                await welcome.set(interaction.guild.id, { channel: channel.id, message: message });

                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜セットアップしました' })
                .setColor("Blurple")
                .setDescription(`通知するチャンネル:${channel}\n通知するメッセージ:${message}`)

              await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply({ content: `入出メッセージ機能が有効化されていません。`, flags: MessageFlags.Ephemeral })
            } else {
                await welcome.delete(interaction.guild.id);
                return await interaction.reply({ content: `入出メッセージ機能を無効にしました。`, flags: MessageFlags.Ephemeral })
            }
        }
    }
}