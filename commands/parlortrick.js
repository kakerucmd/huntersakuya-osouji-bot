const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const { createEmbed } = require('../functions/createembed');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');

const guildsPlaying = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parlortrick')
        .setDescription('PARLOR TRICKを再生します。'),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        if (guildsPlaying.has(guildId)) {
            const embed = createEmbed('⚠️｜エラー', '#ffcc00', 'このサーバーでは既にPARLOR TRICKが再生されています。');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const channel = interaction.member.voice.channel;
        if (!channel) {
            const embed = createEmbed('⚠️｜エラー', '#ffcc00', 'ボイスチャンネルに参加してから実行してください。');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const filePath = path.join(__dirname, '../audio', 'PARLOR TRICK.mp3');
        let resource;

        try {
            resource = createAudioResource(filePath);
            player.play(resource);
            connection.subscribe(player);

            const timestamp = Date.now();
            guildsPlaying.set(guildId, true);

            const pauseButton = new ButtonBuilder()
                .setCustomId(`pause_${timestamp}_${userId}`)
                .setEmoji('⏸️')
                .setStyle(ButtonStyle.Primary);

            const playButton = new ButtonBuilder()
                .setCustomId(`play_${timestamp}_${userId}`)
                .setEmoji('▶')
                .setStyle(ButtonStyle.Success);

            const stopButton = new ButtonBuilder()
                .setCustomId(`stop_${timestamp}_${userId}`)
                .setEmoji('🛑')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(pauseButton, playButton, stopButton);

            player.on(AudioPlayerStatus.Playing, () => {
                const embed = createEmbed('✅｜成功', '#00ff00', 'PARLOR TRICKの再生開始に成功しました🎧');
                interaction.editReply({ embeds: [embed], components: [row] });
            });

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                guildsPlaying.delete(guildId);
                const embed = createEmbed('✅｜終了', '#00ff00', '再生が終了しました🎧');
                interaction.editReply({ embeds: [embed], components: [] });
            });

            const filter = i => i.customId.endsWith(`_${timestamp}_${userId}`) && i.user.id === userId;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 3600000 });

            const stopembed = createEmbed('🛑｜停止', '#ff0000', '再生を停止しました');

            collector.on('collect', async i => {
                if (i.customId === `play_${timestamp}_${userId}`) {
                    player.unpause();
                    await i.deferUpdate();
                } else if (i.customId === `pause_${timestamp}_${userId}`) {
                    player.pause();
                    await i.deferUpdate();
                } else if (i.customId === `stop_${timestamp}_${userId}`) {
                    player.stop();
                    connection.destroy();
                    guildsPlaying.delete(guildId);
                    await i.update({ embeds: [stopembed], components: [] });
                }
            });

        } catch (error) {
            console.error(error);
            guildsPlaying.delete(guildId);
            const embed = createEmbed('❌｜エラー', '#ff0000', '再生中にエラーが発生しました。');
            interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            const embed = createEmbed('⚠️｜切断', '#00ff00', 'ボイスチャンネルから切断されました');
            interaction.followUp({ embeds: [embed] });
            connection.destroy();
            guildsPlaying.delete(guildId);
        });
    },
};