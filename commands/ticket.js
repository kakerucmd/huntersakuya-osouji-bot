const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const Keyv = require('keyv');
const ticket = new Keyv('sqlite://db.sqlite', { table: 'ticket' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('チケット機能の管理')
        .addSubcommand(command => command.setName('send').setDescription('チケットを送信').addStringOption(option => option.setName('name').setDescription('セレクトメニューの名前').setRequired(true)).addStringOption(option => option.setName('message').setDescription('埋め込みに追加するメッセージ').setRequired(false)))
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
                var message = options.getString('message') || 'お問い合わせをするためにはチケットを作成してください。\n以下を選択したら、チケットを作成する理由を入力してください。';

                const select = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('ticketCreateSelect')
                            .setPlaceholder(`🌏 ${name}`)
                            .setMinValues(1)
                            .addOptions(
                                {
                                    label: '新しいチケットを作成',
                                    description: 'クリックされたらチケットを作成します。',
                                    value: 'createTicket'
                                }
                            )
                    );

                const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle('✨ チケットを作成する')
                    .setDescription(message + '🎫')
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

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