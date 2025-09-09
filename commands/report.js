const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, Collection, MessageFlags } = require('discord.js');

const reportHistory = new Collection();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('指定したユーザーを通報します')
		.addUserOption(option => option.setName('user').setDescription('ユーザーを指定').setRequired(true)),
	async execute(interaction) {
		const userId = interaction.user.id;
		const currentTime = Date.now();
		const reportedUser = interaction.options.getUser('user');

		if (reportedUser.bot) {
			return interaction.reply({ content: 'Botを通報することはできません。', flags: MessageFlags.Ephemeral });
		}

		if (reportHistory.has(userId) && currentTime - reportHistory.get(userId) < 600000) {
			return interaction.reply({ content: '連続した通報は行えません。', flags: MessageFlags.Ephemeral });
		}

		const modal = new ModalBuilder()
			.setCustomId('reportModal')
			.setTitle('ユーザーの通報');

		const reportTitleInput = new TextInputBuilder()
			.setCustomId('reportTitle')
			.setLabel("通報の概要")
			.setStyle(TextInputStyle.Short)
            .setRequired(true);

		const reportDescriptionInput = new TextInputBuilder()
			.setCustomId('reportDescription')
			.setLabel("通報の理由")
			.setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('証拠となる画像のURLの添付をお願いします')
            .setRequired(true);

		const firstActionRow = new ActionRowBuilder().addComponents(reportTitleInput);
		const secondActionRow = new ActionRowBuilder().addComponents(reportDescriptionInput);
		modal.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);
		const filter = (mInteraction) => mInteraction.customId === 'reportModal';
		interaction.awaitModalSubmit({ filter, time: 600000 })
			.then(async mInteraction => {
				const reportTitle = mInteraction.fields.getTextInputValue('reportTitle');
				const reportDescription = mInteraction.fields.getTextInputValue('reportDescription');

				const reportChannelId = '"your-channel-id-goes-here';

				const reportChannel = await interaction.client.channels.fetch(reportChannelId);
				if (reportChannel && reportChannel.type === ChannelType.GuildText) {
					const reportEmbed = new EmbedBuilder()
						.setTitle("ユーザーが通報されました")
						.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setThumbnail(reportedUser.displayAvatarURL())
                        .setDescription(`**通報されたユーザー:** ${reportedUser.tag} (${reportedUser.id})\n**通報者:** ${interaction.user.tag} (${interaction.user.id})\n**概要:** ${reportTitle}\n**理由:** ${reportDescription}`)
                        .setColor("Blurple")
						.setTimestamp();

					await reportChannel.send({ embeds: [reportEmbed] });
				}

				reportHistory.set(userId, currentTime);

				await mInteraction.reply({ content: '通報が正常に送信されました。\nBot管理者が手動で確認するため、対応が遅くなる可能性があります。', flags: MessageFlags.Ephemeral });
			})
			.catch(console.error);
	},
};