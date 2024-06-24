const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Keyv = require('keyv');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 111;
const EXP_PER_LEVEL = 10;

function drawFilledRectangle(ctx, x, y, width, height, isLeft) {
    ctx.beginPath();
    if (isLeft) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
    }
    ctx.closePath();
    ctx.fill();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level_card')
        .setDescription('指定したユーザーのレベルを画像で表示します')
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを確認したいユーザー(未指定な場合コマンド実行者のレベルを表示します)')
                .setRequired(false)),
    async execute(interaction) {
        const isEnabled = await settings.get(interaction.guild.id);
        if (!isEnabled) { 
            return interaction.reply({ content: `このサーバーではレベル機能が有効化されていません。`, ephemeral: true });
        } 

        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const key = `${user.id}-${interaction.guild.id}`; 
        const level = (await levels.get(key)) || { count: 0, level: 1 };

        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const backgroundImagePath = path.resolve(__dirname, '../images/canvas.png');
        const backgroundImage = await loadImage(backgroundImagePath);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(user.displayAvatarURL({ format: 'png' }));

        const avatarX = 25;
        const avatarY = 25;
        const avatarSize = 200;
        const avatarRadius = 100;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.closePath();

        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(user.username, 250, 60);

        ctx.font = 'bold 30px Arial';
        ctx.fillText(`Lv ${level.level}`, 250, 110);

        let progressText;
        let progress;

        if (level.level === MAX_LEVEL) {
            progressText = `XP: 1110XP (MAX)`;
            progress = 400;
        } else {
            const percentage = Math.round((level.count * 100) / (EXP_PER_LEVEL * level.level));
            progressText = `XP: ${level.count}/${EXP_PER_LEVEL * level.level} (${percentage}%)`;
            progress = Math.round((level.count / (EXP_PER_LEVEL * level.level)) * 400);
        }        

        ctx.fillText(progressText, 250, 160);

        const progressBarX = 250;
        const progressBarY = 175;
        const progressBarWidth = 400;
        const progressBarHeight = 40;
        const borderRadius = 20;

        ctx.fillStyle = '#ffffff';
        drawFilledRectangle(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, borderRadius, true);

        ctx.fillStyle = '#78b159';
        drawFilledRectangle(ctx, progressBarX, progressBarY, progress, progressBarHeight, borderRadius, false);

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'level.png' });

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.guild.name}`,
                iconURL: `${interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'}`
            })
            .setImage('attachment://level.png')
            .setColor("Blurple")
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], files: [attachment] });
    },
};