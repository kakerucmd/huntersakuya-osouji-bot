const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');

const msg_url_embed = new Keyv('sqlite://db.sqlite', { table: 'msgurlembed' });

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        try {
            const data = await msg_url_embed.get(message.guild.id);
            if (!data) return;

            if (message.author.id === client.user.id) return;
      
            if (message.author.bot) return;
            const MESSAGE_URL_REGEX = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
            const matches = MESSAGE_URL_REGEX.exec(message.content);
            if (matches) {
              const [_, guildId, channelId, messageId] = matches;
              const guild = await client.guilds.fetch(guildId);
              const channel = await client.channels.fetch(channelId);

              if (guild.id !== message.guild.id) {
                return;
              }
          
              const fetchedMessage = await channel.messages.fetch(messageId);
          
              const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setAuthor({ name: fetchedMessage.author.tag, iconURL: fetchedMessage.author.displayAvatarURL() })
                .setFooter({ text: `${guild.name}`, iconURL: `${guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}` })
                .setTimestamp(fetchedMessage.createdTimestamp);

              if (fetchedMessage.content) {
                embed.setDescription(`${fetchedMessage.content}\n\n[元メッセージ](${fetchedMessage.url})`);
              }

              let imageurl = null;
              if (fetchedMessage.attachments.size > 0) {
                fetchedMessage.attachments.forEach(attachment => {
                  if (attachment.contentType.startsWith('image/')) {
                    imageurl = attachment.url;
                  } else {
                    embed.addFields(
                      { name: '添付ファイル', value: `[${attachment.name}](${attachment.url})` }
                    );
                  }
                });
              }

              if (imageurl) {
                embed.setImage(imageurl);
              }
          
              message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
      }
	},
};