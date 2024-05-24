const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Keyv = require('keyv');
const joinleavelog = new Keyv('sqlite://db.sqlite', { table: 'joinleavelog' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('joinleavelogs')
    .setDescription('入退室ログの管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false)
    .addSubcommand(command => command.setName('setup').setDescription('入退室ログをセットアップします').addChannelOption(option => option.setName('channel').setDescription('入退室ログを送信するチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('入退室ログを無効にします')),
    async execute (interaction) {

        const  { options } = interaction;
        const sub = options.getSubcommand();
        const data = await joinleavelog.get(interaction.guild.id);

        switch (sub) {
            case 'setup':

            if (data){
                return await interaction.reply({ content: '既に入退室ログはセットアップされています。', ephemeral: true });
            } else {
                const channel = options.getChannel('channel')

                await joinleavelog.set(interaction.guild.id, { channel: channel.id });

                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜セットアップしました' })
                .setColor("Blurple")
                .setDescription(`通知するチャンネル:${channel}`)

              await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply({ content: `入退室ログが有効化されていません。`, ephemeral: true })
            } else {
                await joinleavelog.delete(interaction.guild.id);
                return await interaction.reply({ content: `入退室ログを無効にしました。`, ephemeral: true })
            }
        }
    }
}