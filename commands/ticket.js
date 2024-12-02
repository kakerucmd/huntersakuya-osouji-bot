const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, InteractionContextType } = require('discord.js');
const Keyv = require('keyv');
const ticket = new Keyv('sqlite://db.sqlite', { table: 'ticket' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('チケット機能の管理')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName('send').setDescription('チケットを送信').addStringOption(option => option.setName('name').setDescription('セレクトメニューのプレースホルダーの名前を指定').setRequired(true)).addStringOption(option => option.setName('description').setDescription('埋め込みのメッセージ').setRequired(false)))
        .addSubcommand(command => command.setName('setup').setDescription('チケットのカテゴリーを設定').addChannelOption(option => option.setName('category').setDescription('チケットを作成するカデコリーを設定').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription('チケット機能を無効化'))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await ticket.get(interaction.guild.id);

        switch (sub) {
            case 'send':
                if (!data) return await interaction.reply({ content: 'このコマンドを実行する前に、/ticket setupコマンドを実行する必要があります。', ephemeral: true });

                const name = options.getString('name');
                const description = options.getString('description') || 'チケットを作成することで、サーバー管理者に対してお問い合わせができます。';

                const select = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('ticketCreateSelect')
                            .setPlaceholder(`🌏 ${name}`)
                            .setMinValues(1)
                            .addOptions(
                                {
                                    label: '新しいチケットを作成',
                                    description: '新しくチケットを作成します。',
                                    value: 'createTicket',
                                    emoji: '🎫'
                                }
                            )
                    );

                    const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle('✨ チケットを作成する')
                    .setDescription(description + '🎫')
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}` });

                await interaction.reply({ content: 'チケットパネルを送信しました。', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [select] });
                break;
            case 'remove':
                if (!data) return await interaction.reply({ content: 'まだチケット機能は設定されていません。', ephemeral: true });
                else {
                    await ticket.delete(interaction.guild.id);
                    await interaction.reply({ content: 'チケットのカテゴリーを削除しました。', ephemeral: true  });
                }
                break;
            case 'setup':
                if (data) return await interaction.reply({ content: `既にチケットのカテゴリーが<#${data.Category}>に設定されています。`, ephemeral: true });
                else {
                    const category = options.getChannel('category');
                    await ticket.set(interaction.guild.id, { Category: category.id });
                    await interaction.reply({ content: `チケットのカテゴリーを**${category}**に設定しました！\nチケットパネルの送信には/ticket sendを使用してください。`, ephemeral: true });
                }
        }
    },
};