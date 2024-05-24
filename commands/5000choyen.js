const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('5000choyen')
		.setDescription('5000兆円画像生成(合計32文字以下になるようにしてください)'),
	async execute(interaction) {
		try {
			const modalId = '5000choyen' + interaction.user.id + Date.now();
			const modal = createModal(modalId);
			await interaction.showModal(modal);

			const filter = (mInteraction) => mInteraction.customId.startsWith(modalId);
			let mInteraction;
			try {
				mInteraction = await interaction.awaitModalSubmit({ filter, time: 1200000 });
			} catch (error) {
				return;
			}

			const { top, bottom } = getTextInputValues(mInteraction);
			await mInteraction.deferReply();
			await replyWithImage(mInteraction, top, bottom);
		} catch (error) {
			console.error(error);
		}
	},
};

function createModal(modalId) {
	const modal = new ModalBuilder()
		.setCustomId(modalId)
		.setTitle('5000兆円画像生成');

	const topInput = new TextInputBuilder()
		.setCustomId('topInput')
		.setLabel("上部文字列")
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('下部文字列をここに入力');

	const bottomInput = new TextInputBuilder()
		.setCustomId('bottomInput')
		.setLabel("下部文字列")
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('下部文字列をここに入力');

	modal.addComponents(new ActionRowBuilder().addComponents(topInput), new ActionRowBuilder().addComponents(bottomInput));

	return modal;
}

function getTextInputValues(mInteraction) {
	const top = mInteraction.fields.getTextInputValue('topInput');
	const bottom = mInteraction.fields.getTextInputValue('bottomInput');
	if (!top || !bottom) {
		throw new Error('上部文字列と下部文字列は必須です。');
	}
	return { top, bottom };
}

function validateInput(top, bottom) {
    if (top.length + bottom.length > 32) {
        throw new Error('上部文字列と下部文字列の合計は32文字以内で入力してください。');
    }
}

async function replyWithImage(mInteraction, top, bottom) {
    try {
        validateInput(top, bottom);
        const encodedTop = encodeURIComponent(top);
        const encodedBottom = encodeURIComponent(bottom);

        const embed = new EmbedBuilder()
			.setColor("Blurple")
            .setImage(`https://gsapi.cbrx.io/image?top=${encodedTop}&bottom=${encodedBottom}&type=png`)
            .setFooter({ text: 'Powered by 5000choyen-api' })

		await mInteraction.editReply({ embeds: [embed] });
    } catch (error) {
        await mInteraction.editReply({ content: 'エラーが発生しました。' });
    }
}