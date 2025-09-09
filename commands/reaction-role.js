const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const reactionrole = new Keyv('sqlite://db.sqlite', { table: 'reactionrole' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-role')
        .setDescription('指定したロールのリアクションロールパネルを作成します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addRoleOption(option => option.setName('role1').setDescription('1つ目のロールを選択(必須)').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('埋め込みのタイトルを指定(任意)').setRequired(false))
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

            const roles = ['role1', 'role2', 'role3', 'role4', 'role5', 'role6', 'role7', 'role8', 'role9', 'role10']
                .map(roleName => interaction.options.getRole(roleName))
                .filter(role => role);

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
            const emojiNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
            let description = '';

            const roleData = {};

            for (let i = 0; i < uniqueRoles.length; i++) {
                const role = uniqueRoles[i];
                description += `${emojiNumbers[i]}: <@&${role.id}>\n`;
                roleData[emojiNumbers[i]] = role.id;
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor("Blurple")
                .setDescription(description)
                .setFooter({ text: `${interaction.guild.name}` });

            const message = await interaction.channel.send({ embeds: [embed] });

            await reactionrole.set(`${interaction.guild.id}-${message.id}`, roleData);

            for (let i = 0; i < uniqueRoles.length; i++) {
                await message.react(emojiNumbers[i]);
            }

            await interaction.editReply({ content: 'リアクションロールパネルの作成に成功しました。' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'リアクションロールパネルの作成中にエラーが発生しました。' });
        }
    },
};