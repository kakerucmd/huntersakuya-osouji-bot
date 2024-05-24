const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Keyv = require('keyv');

const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('レベル機能の管理')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false)
    .addSubcommand(command => command.setName('setup').setDescription('レベル機能をセットアップします').addChannelOption(option => option.setName('channel').setDescription('レベルアップ時に通知を送信するチャンネル').addChannelTypes(ChannelType.GuildText).setRequired(false)).addStringOption(option => option.setName('message').setDescription('レベルアップ時に通知するメッセージ(詳細はドキュメントをお読みください)').setRequired(false)))
    .addSubcommand(command => command.setName('disable').setDescription('レベル機能の設定を削除し、無効にします。レベルは削除されません。')),

    async execute (interaction) {

        const  { options } = interaction;
        const sub = options.getSubcommand();
        const data = await settings.get(interaction.guild.id);

        switch (sub) {
            case 'setup':

            if (data){
                return await interaction.reply({ content: '既にレベル機能はセットアップされています。', ephemeral: true });
            } else {
                const channel = options.getChannel('channel')
                const message = options.getString('message')

                await settings.set(interaction.guild.id, true);
                if (channel) {
                  await channels.set(interaction.guild.id, channel.id);
                }
                if (message) {
                  await messages.set(interaction.guild.id, message);
                }

                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜セットアップしました' })
                .setColor("Blurple")
                .setDescription(`通知するチャンネル:${channel ? channel : '通知しない'}\n通知するメッセージ:${message ? message : 'デフォルトのメッセージが使用されます。'}`)

              await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply({ content: `レベル機能が有効化されていません。`, ephemeral: true })
            } else {
                await settings.delete(interaction.guild.id);
                await messages.delete(interaction.guild.id);
                await channels.delete(interaction.guild.id);
                return await interaction.reply({ content: `レベル機能の設定を削除し、無効にしました。`, ephemeral: true })
            }
        }
        
    }
}