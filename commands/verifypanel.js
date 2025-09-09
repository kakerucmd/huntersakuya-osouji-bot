const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const verify = new Keyv('sqlite://db.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verifypanel')
        .setDescription('指定したロールの認証パネルを作成します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName('verifyformat')
                .setDescription('認証形式を選択(必須)')
                .setRequired(true)
                .addChoices(
                    { name: `ボタン認証`, value: `button` },
                    { name: `計算認証`, value: `calc` },
                ))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('ロールを選択(必須)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('埋め込みのタイトルを指定(任意)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('button-name')
                .setDescription('ボタンのラベルを指定(任意)')
                .setRequired(false)),
                
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                
            const role = interaction.options.getRole('role');
            
            if (!role) {
                return interaction.editReply({ content: '指定されたロールがこのサーバーに存在しません。' });
            }

            if (role.id === interaction.guild.roles.everyone.id || role.managed) {
                return interaction.editReply({ content: '連携ロール、@everyone、@hereは選択できません。' });
            }
    
            const verifyFormat = interaction.options.getString('verifyformat');
            const title = interaction.options.getString('title') || (verifyFormat === 'button' ? '認証パネル' : '計算認証パネル');
            const buttonLabel = interaction.options.getString('button-name') || (verifyFormat === 'button' ? '認証' : '計算認証');                        
    
            let description;
            let customId;
    
            if (verifyFormat === 'button') {
                description = `下のボタンを押して認証\nロール: <@&${role.id}>\n`;
                customId = `buttonrole_${role.id}`;
                await verify.set(`${interaction.guild.id}_${role.id}`, { role: role.id });
            } else if (verifyFormat === 'calc') {
                description = `下のボタンを押して計算認証\nロール: <@&${role.id}>\n`;
                customId = `osouzirole_${role.id}`;
                await verify.set(`${interaction.guild.id}_${role.id}`, { role: role.id });
            }
    
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(customId)
                        .setLabel(buttonLabel)
                        .setStyle(ButtonStyle.Primary)
                );
    
            if (!interaction.options.getString('button-name')) {
                row.components[0].setEmoji('✅');
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor("Blurple")
                .setDescription(description);
    
            await interaction.editReply({ content: '認証パネルを作成中...' });
            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({ content: '認証パネルの作成に成功しました' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '認証パネルの作成中にエラーが発生しました。' });
        }
    },
};