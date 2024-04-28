const { Events, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const Keyv = require('keyv');
const ticket = new Keyv('sqlite://db.sqlite', { table: 'ticket' });

module.exports = {
    name:Events.InteractionCreate,
    async execute(interaction) {

        client = interaction.client

        if (interaction.customId == 'ticketCreateSelect') {
            const modal = new ModalBuilder()
            .setTitle('チケットを作成する')
            .setCustomId('ticketModal')

            const why = new TextInputBuilder()
            .setCustomId('whyTicket')
            .setRequired(true)
            .setPlaceholder('このチケットを作成した理由')
            .setLabel('なぜチケットを作成しましたか？')
            .setStyle(TextInputStyle.Paragraph);

            const info = new TextInputBuilder()
            .setCustomId('infoTicket')
            .setRequired(false)
            .setPlaceholder('空欄のままでも結構です')
            .setLabel('その他追加情報')
            .setStyle(TextInputStyle.Paragraph);

            const one = new ActionRowBuilder().addComponents(why);
            const two = new ActionRowBuilder().addComponents(info);

            modal.addComponents(one, two);
            await interaction.showModal(modal);
        } else if (interaction.customId == 'ticketModal'){
            const user = interaction.user;
            const data = await ticket.get(interaction.guild.id);
            if (!data) return await interaction.reply({ content: 'このサーバーではまだチケット機能がセットアップされていません。\nサーバー管理者に連絡してください。', ephemeral: true });
            else {
                const why = interaction.fields.getTextInputValue('whyTicket');
                const info = interaction.fields.getTextInputValue('infoTicket');
                const category = await interaction.guild.channels.cache.get(data.Category);
                
                const channel = await interaction.guild.channels.create({
                    name: `ticket- ${user.id}`,
                    type: ChannelType.GuildText,
                    topic: `Ticket user: ${user.username}; Ticket reason: ${why}`,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle(`Ticket from ${user.username} 🎫`)
                .setDescription(`チケットを開いた理由：${why}\nその他の情報：${info}`)
                .setTimestamp();

                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('closeTicket')
                    .setLabel('チケットをクローズする')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
                );

                await channel.send({ embeds: [embed], components: [button] });
                await interaction.reply({ content:`チケットをオープンしました！\n${channel}`, ephemeral: true });
            }
        } else if (interaction.customId == 'closeTicket') {
            const closeModal = new ModalBuilder()
            .setTitle('チケットをクローズ')
            .setCustomId('closeTicketModal')

            const reason = new TextInputBuilder()
            .setCustomId('closeReasonTicket')
            .setRequired(true)
            .setPlaceholder('チケットを閉じる理由は何ですか？')
            .setLabel('チケットを閉じる理由を入力')
            .setStyle(TextInputStyle.Paragraph);

            const one = new ActionRowBuilder().addComponents(reason);

            closeModal.addComponents(one);
            await interaction.showModal(closeModal);       
        } else if (interaction.customId == 'closeTicketModal') {
            var channel = interaction.channel;
            var name = channel.name;
            name = name.replace('ticket-','');
            const member = await interaction.guild.members.cache.get(name);

            const reason = interaction.fields.getTextInputValue('closeReasonTicket');
            await interaction.reply({ content: `このチケットを閉じます...` })

            setTimeout(async () => {
                await channel.delete().catch(err => {});
                const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜クローズ成功' })
                .setDescription(`${interaction.guild.name}のチケットがクローズされました。\n理由：${reason}`)
                .setColor('#00ff00');
                await member.send({ embeds: [embed] }).catch(err => {});
            },5000)
        }
    },
};