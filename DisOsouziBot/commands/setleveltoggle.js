const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, ChannelType } = require('discord.js');
const Keyv = require('keyv');

const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });

module.exports = {
    data: new SlashCommandBuilder()
      .setName('settogglelevel')
      .setDescription('レベル機能を有効にするか設定します')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .setDMPermission(false)
      .addBooleanOption(option => 
        option.setName('enable')
          .setDescription('有効または無効にします')
          .setRequired(true))
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('通知を送るチャンネルを指定します')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false))
      .addStringOption(option => 
        option.setName('message')
          .setDescription('通知するメッセージを指定します。メッセージ中に{user.name}、{user}、{level}を含めると、それぞれユーザーのディスプレイネーム、ユーザーのメンション、レベルに置き換えられます。')
          .setRequired(false)),
    async execute(interaction) {
      try {

        const enable = interaction.options.getBoolean('enable');
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        await levelsettings.set(interaction.guild.id, enable);
        if (channel) {
          await channels.set(interaction.guild.id, channel.id);
        }
        if (message) {
          await messages.set(interaction.guild.id, message);
        }
        return interaction.reply({ content: `レベル機能が${enable ? '有効化' : '無効化'}されました。${channel ? `通知は <#${channel.id}> に送られます。` : ''}${message ? `メッセージは "${message}" に設定されました。` : ''}`, ephemeral: true });
      } catch (error) {
        console.error(`エラーが発生しました: ${error}`);
      }
    },
  };
