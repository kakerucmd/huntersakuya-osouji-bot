const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 99;

// 丸角四角形
function drawRoundedRect(ctx, x, y, width, height, radius, fillColor) {
    if (width <= 0) return;
    ctx.beginPath();
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

// プログレスバー
function drawProgressBar(ctx, x, y, width, height, radius, fillWidth, fillColor) {
    drawRoundedRect(ctx, x, y, width, height, radius, '#EDEDED');

    if (fillWidth > 0) {
        const isFull = fillWidth >= width;
        const leftRadius = radius;
        const rightRadius = isFull ? radius : 0;

        ctx.beginPath();
        ctx.moveTo(x + leftRadius, y);
        ctx.lineTo(x + fillWidth - rightRadius, y);

        if (rightRadius > 0) {
            ctx.quadraticCurveTo(x + fillWidth, y, x + fillWidth, y + rightRadius);
            ctx.lineTo(x + fillWidth, y + height - rightRadius);
            ctx.quadraticCurveTo(x + fillWidth, y + height, x + fillWidth - rightRadius, y + height);
        } else {
            ctx.lineTo(x + fillWidth, y);
            ctx.lineTo(x + fillWidth, y + height);
        }

        ctx.lineTo(x + leftRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - leftRadius);
        ctx.lineTo(x, y + leftRadius);
        ctx.quadraticCurveTo(x, y, x + leftRadius, y);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

function calculateTotalXP(level, currentXP) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += Math.floor(5 * Math.pow(i, 1.5));
    }
    return total + currentXP;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level_card')
        .setDescription('指定したユーザーのレベルを画像で表示します')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを確認したいユーザー(未指定なら実行者)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const isEnabled = await settings.get(interaction.guild.id);
        if (!isEnabled) {
            return interaction.reply({
                content: 'このサーバーではレベル機能が有効化されていません。',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const key = `${user.id}-${interaction.guild.id}`;
        const level = (await levels.get(key)) || { count: 0, level: 1 };
        const totalXP = calculateTotalXP(level.level, level.count);

        const scale = 2;
        const canvas = createCanvas(700 * scale, 250 * scale);
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // 背景
        const background = await loadImage(path.resolve(__dirname, '../images/canvas.png'));
        ctx.drawImage(background, 0, 0, 700, 250);

        // UIブラー
        const uiX = 15, uiY = 15, uiWidth = 670, uiHeight = 220, uiRadius = 20;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(uiX, uiY, uiWidth, uiHeight, uiRadius);
        ctx.clip();
        ctx.filter = 'blur(4px) brightness(1.05)';
        ctx.drawImage(background, 0, 0, 700, 250);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(uiX, uiY, uiWidth, uiHeight);
        ctx.restore();
        ctx.filter = 'none';

        // アバター
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 1024 }));
        const avatarX = 25, avatarY = 25, avatarSize = 200, avatarRadius = 100;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#EDEDED';
        ctx.stroke();

        const member = interaction.guild.members.cache.get(user.id);
        const displayName = member?.displayName ?? user.username;

        // ユーザー名
        ctx.font = 'bold 40px Arial';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000';
        ctx.strokeText(displayName, 250, 60);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(displayName, 250, 60);

        // ===== Lv表示 =====
        const lvText = level.level === MAX_LEVEL
            ? `Lv ${level.level} (MAX)`
            : `Lv ${level.level} (Total:${totalXP}XP)`;

        ctx.font = 'bold 30px Arial';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.strokeText(lvText, 250, 110);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(lvText, 250, 110);

        // ===== XP表示 =====
        let progressText, progress;

        if (level.level === MAX_LEVEL) {
            progressText = `(Total:${totalXP}XP)`;
            progress = 400;
        } else {
            const EXP_TO_NEXT = Math.floor(5 * Math.pow(level.level, 1.5));
            const percent = Math.round((level.count / EXP_TO_NEXT) * 100);

            progressText = `XP:${level.count}/${EXP_TO_NEXT} (${percent}%)`;
            progress = Math.round((level.count / EXP_TO_NEXT) * 400);
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.strokeText(progressText, 250, 160);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(progressText, 250, 160);

        // プログレスバー
        drawProgressBar(ctx, 250, 175, 400, 40, 20, progress, '#8fd469');

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.roundRect(250, 175, 400, 40, 20);
        ctx.stroke();

        // 外枠
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#EDEDED';
        ctx.strokeRect(0, 0, 700, 250);

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'level.png' });

        await interaction.editReply({ files: [attachment] });
    },
};
