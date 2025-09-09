const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const Keyv = require('keyv');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const settings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });

const MAX_LEVEL = 99;
const EXP_PER_LEVEL = 10;
const MAX_XP_DISPLAY = 1110;

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
    // プログレスバー背景
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level_card')
        .setDescription('指定したユーザーのレベルを画像で表示します')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('レベルを確認したいユーザー(未指定なら実行者)')
                .setRequired(false)),
    async execute(interaction) {
        const isEnabled = await settings.get(interaction.guild.id);
        if (!isEnabled) return interaction.reply({ content: 'このサーバーではレベル機能が有効化されていません。', flags: MessageFlags.Ephemeral });

        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const key = `${user.id}-${interaction.guild.id}`;
        const level = (await levels.get(key)) || { count: 0, level: 1 };

        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // 背景描画
        const background = await loadImage(path.resolve(__dirname, '../images/canvas.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // UIのブラー・半透明オーバーレイ
        const uiX = 15, uiY = 15, uiWidth = 670, uiHeight = 220, uiRadius = 20;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(uiX, uiY, uiWidth, uiHeight, uiRadius);
        ctx.clip();
        ctx.filter = 'blur(4px) brightness(1.05)';
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(uiX, uiY, uiWidth, uiHeight);
        ctx.restore();
        ctx.filter = 'none';

        // アイコン
        const avatar = await loadImage(user.displayAvatarURL({ format: 'png' }));
        const avatarX = 25, avatarY = 25, avatarSize = 200, avatarRadius = 100;
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // アイコン枠線
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#EDEDED';
        ctx.stroke();
        ctx.closePath();

        // ユーザー名
        ctx.font = 'bold 40px Arial';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(user.username, 250, 60);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(user.username, 250, 60);

        // レベル
        ctx.font = 'bold 30px Arial';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(`Lv ${level.level}`, 250, 110);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(`Lv ${level.level}`, 250, 110);

        // XP計算
        let progressText, progress;
        if (level.level === MAX_LEVEL) {
            progressText = `XP: ${MAX_XP_DISPLAY} (MAX)`; // MAX固定
            progress = 400;
        } else {
            const requiredXP = EXP_PER_LEVEL * level.level;
            progressText = `XP: ${level.count}/${requiredXP} (${Math.round((level.count / requiredXP) * 100)}%)`;
            progress = Math.round((level.count / requiredXP) * 400);
        }

        // XPテキスト
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(progressText, 250, 160);
        ctx.fillStyle = '#EDEDED';
        ctx.fillText(progressText, 250, 160);

        // プログレスバー描画
        drawProgressBar(ctx, 250, 175, 400, 40, 20, progress, '#78b159');

        // プログレスバーの枠線
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(250 + 20, 175);
        ctx.lineTo(250 + 400 - 20, 175);
        ctx.quadraticCurveTo(250 + 400, 175, 250 + 400, 175 + 20);
        ctx.lineTo(250 + 400, 175 + 40 - 20);
        ctx.quadraticCurveTo(250 + 400, 175 + 40, 250 + 400 - 20, 175 + 40);
        ctx.lineTo(250 + 20, 175 + 40);
        ctx.quadraticCurveTo(250, 175 + 40, 250, 175 + 40 - 20);
        ctx.lineTo(250, 175 + 20);
        ctx.quadraticCurveTo(250, 175, 250 + 20, 175);
        ctx.closePath();
        ctx.stroke();

        // 外枠
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#EDEDED';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'level.png' });
        await interaction.editReply({ files: [attachment] });
    },
};
