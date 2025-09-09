const fs = require('node:fs');
const { Events, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        try {
            if (interaction.customId === 'raitai_enemy_simulator') {
                const data = await fs.promises.readFile('./enemy_data_V2.json', 'utf-8');
                const jsonData = JSON.parse(data);

                const content = [];
                const selectedElements = [];

                for (let wave = 1; wave <= 4; wave++) {
                    const numElements = Math.floor(Math.random() * 3) + 1;
                    const waveElements = [];

                    for (let i = 0; i < numElements; i++) {
                        let randomIndex, randomElement;
                        do {
                            randomIndex = Math.floor(Math.random() * jsonData.length);
                            randomElement = jsonData[randomIndex];
                        } while (selectedElements.includes(randomElement));
                        selectedElements.push(randomElement);
                        waveElements.push(randomElement);
                    }

                    const waveContent = waveElements.map(element => {
                        const weaknesses = element.weaknesses.join('・');
                        const resistances = element.resistances.join('・');
                        return `**${element.name} (${element.Barrier}枚勢)**\n弱点: ${weaknesses}\n耐性: ${resistances}\nスキル: ${element.skill}`;
                    }).join('\n\n');                    

                    content.push(`**${wave}wave目**\n${waveContent}`);
                }

                const raitaiImage = new AttachmentBuilder('./images/raitai.png');

                const raitai_embed = new EmbedBuilder()
                    .setTitle('明日の擂台予報')
                    .setDescription(`実行者：<@${interaction.user.id}>\n\n` + content.join('\n\n'))
                    .setThumbnail('attachment://raitai.png')
                    .setColor("Blurple");

                await interaction.reply({
                    embeds: [raitai_embed],
                    files: [raitaiImage],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('delete_raitai_embed')
                                .setLabel('擂台予報を削除')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('\u{1F5D1}')
                        ),
                    ],
                });
            }

            if (interaction.customId === 'delete_raitai_embed') {
                const message = await interaction.channel.messages.fetch(interaction.message.id);
                await message.delete();
                await interaction.reply({ content: '擂台予報の埋め込みを削除しました。', flags: MessageFlags.Ephemeral });
            }
        } catch (err) {
            console.error(`エラーが発生しました: ${err}`);
            await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
        }
    },
};
