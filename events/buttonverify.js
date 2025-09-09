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
        const roleId = interaction.customId.split('_')[1];
        if (interaction.customId === `buttonrole_${roleId}`) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
            if (!guildData) {
                const embed = createEmbed('❌｜ロールの付与/削除失敗', '#ff0000', '認証パネルが無効になっています。\nサーバー管理者に連絡し、認証パネルを再作成してください。');
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
                const embed = createEmbed('✅｜認証済み', '#00ff00', '既に認証済みです。');
                return interaction.editReply({ embeds: [embed] });
            }

            await member.roles.add(role);
            const embed = createEmbed('✅｜認証成功', '#00ff00', `認証に成功しました。\nサーバーのルールを守り、\n**${interaction.guild.name}**をご利用ください。`);
                return interaction.editReply({ embeds: [embed] });
        }
    },
};