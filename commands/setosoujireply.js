const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const Keyv = require('keyv');

const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setosoujireply')
        .setDescription('「お掃除」「上方修正」の単語に対して反応する機能を有効にするか設定します')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addBooleanOption(option => 
            option.setName('enable')
                .setDescription('有効または無効にします')
                .setRequired(true)),
                async execute(interaction) {

        const enable = interaction.options.getBoolean('enable');
        await osouzireply.set(interaction.guild.id, enable);
        return interaction.reply({ content: `「お掃除」「上方修正」などの単語に対して反応する機能が${enable ? '有効化' : '無効化'}されました。`, ephemeral: true });
    },
};