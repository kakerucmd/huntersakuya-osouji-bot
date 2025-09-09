const { EmbedBuilder } = require('discord.js');

function createEmbed(authorName, color, description) {
    return new EmbedBuilder()
        .setAuthor({ name: authorName })
        .setColor(color)
        .setDescription(description);
}

module.exports = { createEmbed };