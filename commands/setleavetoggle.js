const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Keyv = require('keyv');

const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leaveChannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settoggleleave')
        .setDescription('即抜け通知をするチャンネルを設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addBooleanOption(option => 
            option.setName('enable')
                .setDescription('有効または無効にします')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('通知を送るチャンネルを選択します')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)),
    async execute(interaction) {
      try {

        const enable = interaction.options.getBoolean('enable');
        const channel = interaction.options.getChannel('channel');
        if (enable && !channel) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: '❌｜エラー' })
                .setDescription('通知を送信するチャンネルを指定してください。')
                .setColor('#ff0000');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await toggleleave.set(interaction.guild.id, enable);
        if (channel) {
            await leaveChannel.set(interaction.guild.id, channel.id);
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: '✅｜成功' })
            .setDescription(`即抜け通知機能が${enable ? '有効化' : '無効化'}されました。\n${channel ? `通知は <#${channel.id}> に送られます。` : ''}`)
            .setColor('#00ff00');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error(`エラーが発生しました: ${error}`);
      }
    },
};