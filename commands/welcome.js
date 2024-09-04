const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, InteractionContextType } = require('discord.js');
const Keyv = require('keyv');
const welcome = new Keyv('sqlite://db.sqlite', { table: 'welcome' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('ウェルカムメッセージ機能の管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(command => command.setName('setup').setDescription('ウェルカムメッセージ機能をセットアップします').addChannelOption(option => option.setName('channel').setDescription('ウェルカムメッセージを送信するチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(option => option.setName('message').setDescription('送信するメッセージ').setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('ウェルカムメッセージ機能を無効にします')),
    async execute (interaction) {

        const  { options } = interaction;
        const sub = options.getSubcommand();
        const data = await welcome.get(interaction.guild.id);

        switch (sub) {
            case 'setup':

            if (data){
                return await interaction.reply({ content: '既にウェルカムメッセージ機能はセットアップされています。', ephemeral: true });
            } else {
                const channel = options.getChannel('channel')
                const message = options.getString('message')

                await welcome.set(interaction.guild.id, { channel: channel.id, message: message });

                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜セットアップしました' })
                .setColor("Blurple")
                .setDescription(`通知するチャンネル:${channel}\n通知するメッセージ:${message}`)

              await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply({ content: `ウェルカムメッセージ機能が有効化されていません。`, ephemeral: true })
            } else {
                await welcome.delete(interaction.guild.id);
                return await interaction.reply({ content: `ウェルカムメッセージ機能を無効にしました。`, ephemeral: true })
            }
        }
    }
}