const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const verify = new Keyv('sqlite://db.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button-role')
        .setDescription('指定したロールのボタンロールパネルを作成します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addRoleOption(option => option.setName('role1').setDescription('1つ目のロールを選択(必須)').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('埋め込みのタイトルを指定(任意)').setRequired(false))
        .addStringOption(option => option.setName('button-name').setDescription('ボタンのラベルを指定(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role2').setDescription('2つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role3').setDescription('3つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role4').setDescription('4つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role5').setDescription('5つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role6').setDescription('6つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role7').setDescription('7つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role8').setDescription('8つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role9').setDescription('9つ目のロールを選択(任意)').setRequired(false))
        .addRoleOption(option => option.setName('role10').setDescription('10つ目のロールを選択(任意)').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const roles = ['role1', 'role2', 'role3', 'role4', 'role5', 'role6', 'role7', 'role8', 'role9', 'role10'].map(roleName => interaction.options.getRole(roleName)).filter(role => role);

            if (roles.length === 0) {
                return interaction.editReply({ content: '指定されたロールがこのサーバーに存在しません。' });
            }

            const uniqueRoles = [...new Set(roles)];
            if (uniqueRoles.length !== roles.length) {
                return interaction.editReply({ content: '同じロールを複数回選択することはできません。' });
            }

            for (let i = 0; i < uniqueRoles.length; i++) {
                const role = uniqueRoles[i];
                if (role.id === interaction.guild.roles.everyone.id || role.managed) {
                    return interaction.editReply({ content: '連携ロール、@everyone、@hereは選択できません。' });
                }
            }

            const title = interaction.options.getString('title') || 'ロールパネル';
            const buttonLabel = interaction.options.getString('button-name') || 'ロールを取得/解除';

            let description = `下のボタンを押してロールを付与\n※もう一度押したら解除されます\n`;
            const rows = [new ActionRowBuilder()];

            for (let i = 0; i < uniqueRoles.length; i++) {
                const role = uniqueRoles[i];

                if (uniqueRoles.length === 1) {
                    description += `ロール: <@&${role.id}>\n`;
                } else {
                    description += `${i+1}. ロール: <@&${role.id}>\n`;
                }

                const button = new ButtonBuilder()
                    .setCustomId(`get_role_${role.id}`)
                    .setLabel(uniqueRoles.length === 1 ? buttonLabel :`${i+1}`)
                    .setStyle(ButtonStyle.Primary);

                if (rows[rows.length - 1].components.length < 5) {
                    rows[rows.length - 1].addComponents(button);
                } else {
                    const newRow = new ActionRowBuilder().addComponents(button);
                    rows.push(newRow);
                }

                await verify.set(`${interaction.guild.id}_${role.id}`, { role: role.id });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor("Blurple")
                .setDescription(description);

            await interaction.editReply({ content: `ロールパネルを作成中...` });
            await interaction.channel.send({ embeds: [embed], components: rows });
            await interaction.editReply({ content: `ロールパネルの作成に成功しました` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `ロールパネルの作成中にエラーが発生しました。` });
        }
    },
};