const { EmbedBuilder, Events } = require('discord.js');
const Keyv = require('keyv');
const verify = new Keyv('sqlite://db.sqlite');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
  async execute(interaction) {
        if (!interaction.isButton()) return;
        const roleId = interaction.customId.split('_')[1];
        if (interaction.customId === `buttonrole_${roleId}`) {
            await interaction.deferReply({ ephemeral: true });
      
            const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
            if (!guildData) {
              const embed = new EmbedBuilder()
                .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
                .setDescription('認証パネルが無効になっています。\nサーバー管理者に連絡し、認証パネルを再作成してください。')
                .setColor('#ff0000');
              return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
      
            const role = interaction.guild.roles.cache.get(guildData.role);
            if (!role) {
              const embed = new EmbedBuilder()
                .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
                .setDescription('ロールが存在しません')
                .setColor('#ff0000');
              return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
      
            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) {
              const embed = new EmbedBuilder()
                .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
                .setDescription('メンバーが存在しません')
                .setColor('#ff0000');
              return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
      
            const botMember = interaction.guild.members.cache.get(global.client.user.id);
            if (botMember.roles.highest.comparePositionTo(role) <= 0) {
              const embed = new EmbedBuilder()
              .setAuthor({ name: '⚠️｜役職の位置エラー' })
              .setDescription('お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。')
              .setColor('#ffcc00');
              return interaction.editReply({ embeds: [embed], ephemeral: true });
            }
      
            if (member.roles.cache.has(role.id)) {
              const embed = new EmbedBuilder()
               .setAuthor({ name: '✅｜認証済み' })
               .setDescription('既に認証済みです。')
               .setColor('#00ff00');
              return interaction.editReply({ embeds: [embed], ephemeral: true });
            }    
      
            await member.roles.add(role);
            const embed = new EmbedBuilder()
             .setAuthor({ name: '✅｜認証成功' })
             .setDescription(`認証に成功しました。\nサーバーのルールを守り、\n**${interaction.guild.name}**をご利用ください。`)
             .setColor('#00ff00');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }      
	},
};