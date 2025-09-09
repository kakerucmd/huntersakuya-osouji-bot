const { Events, MessageFlags } = require('discord.js');
const { createEmbed } = require('../functions/createembed');

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
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
            if (!guildData) {
                const embed = createEmbed('❌｜ロールの付与/削除失敗', '#ff0000', 'ロールパネルが無効になっています。\nサーバー管理者に連絡し、ロールパネルを再作成してください。');
                return interaction.editReply({ embeds: [embed] });
            }

            const role = interaction.guild.roles.cache.get(guildData.role);
            if (!role) {
                const embed = createEmbed('❌｜ロールの付与/削除失敗', '#ff0000', 'ロールが存在しません');
                return interaction.editReply({ embeds: [embed] });
            }

            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) {
                const embed = createEmbed('❌｜ロールの付与/削除失敗', '#ff0000', 'メンバーが存在しません');
                return interaction.editReply({ embeds: [embed] });
            }

            const botMember = interaction.guild.members.cache.get(client.user.id);
            if (botMember.roles.highest.comparePositionTo(role) <= 0) {
                const embed = createEmbed('⚠️｜役職の位置エラー', '#ffcc00', 'お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。');
                return interaction.editReply({ embeds: [embed] });
            }

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                const embed = createEmbed('❌｜ロールの削除', '#ff0000', `<@&${role.id}>の削除に成功しました`);
                return interaction.editReply({ embeds: [embed] });
            }

            await member.roles.add(role);
            const embed = createEmbed('✅｜ロールの付与', '#00ff00', `<@&${role.id}>の付与に成功しました`);
            return interaction.editReply({ embeds: [embed] });
        }
    },
};