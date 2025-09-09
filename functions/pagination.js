const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');

module.exports = async (interaction, pages, time = 60 * 1000) => {
    try {
        if (!interaction || !pages || !Array.isArray(pages) || pages.length === 0) throw new Error('Invalid arguments');

        await interaction.deferReply();

        if (pages.length === 1) {
            return await interaction.editReply({ embeds: pages, components: [], fetchReply: true });
        }

        let index = 0;

        const first = new ButtonBuilder()
            .setCustomId('pagefirst')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const prev = new ButtonBuilder()
            .setCustomId('pageprev')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const pageCount = new ButtonBuilder()
            .setCustomId('pagecount')
            .setLabel(`${index + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId('pagenext')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary);

        const last = new ButtonBuilder()
            .setCustomId('pagelast')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Primary);

        const buttons = new ActionRowBuilder().addComponents(first, prev, pageCount, next, last);

        const msg = await interaction.editReply({ embeds: [pages[index]], components: [buttons], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return await i.reply({ content: 'あなたはこのページを操作できません。', flags: MessageFlags.Ephemeral });

            await i.deferUpdate();

            if (i.customId === 'pagefirst') index = 0;
            else if (i.customId === 'pageprev') index = index > 0 ? index - 1 : index;
            else if (i.customId === 'pagenext') index = index < pages.length - 1 ? index + 1 : index;
            else if (i.customId === 'pagelast') index = pages.length - 1;

            pageCount.setLabel(`${index + 1}/${pages.length}`);

            first.setDisabled(index === 0);
            prev.setDisabled(index === 0);
            next.setDisabled(index === pages.length - 1);
            last.setDisabled(index === pages.length - 1);

            await msg.edit({ embeds: [pages[index]], components: [buttons] });
            collector.resetTimer();
        });

        collector.on('end', async () => {
            await msg.edit({ embeds: [pages[index]], components: [] }).catch(() => {});
        });

        return msg;
    } catch (e) {
        console.error(`エラーが発生しました: ${e}`);
    }
};