const { Events, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const verify = new Keyv('sqlite://db.sqlite');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const client = interaction.client;
        const roleId = interaction.customId.split('_')[2];
        if (interaction.customId === `get_role_${roleId}`) {
            await interaction.deferReply({ ephemeral: true });

            const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
            if (!guildData) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
                    .setDescription('ロールパネルが無効になっています。\nサーバー管理者に連絡し、ロールパネルを再作成してください。')
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

            const botMember = interaction.guild.members.cache.get(client.user.id);
            if (botMember.roles.highest.comparePositionTo(role) <= 0) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: '⚠️｜役職の位置エラー' })
                    .setDescription('お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。')
                    .setColor('#ffcc00');
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                const embed = new EmbedBuilder()
                    .setAuthor({ name: '❌｜ロールの削除' })
                    .setDescription(`<@&${role.id}>の削除に成功しました`)
                    .setColor('#ff0000');
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜ロールの付与' })
                .setDescription(`<@&${role.id}>の付与に成功しました`)
                .setColor('#00ff00');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};