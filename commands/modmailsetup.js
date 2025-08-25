const { SlashCommandBuilder } = require('discord.js');
const { setModmailSetup } = require('../models/modmailSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-modmail')
        .setDescription('Configure the ModMail system for this server')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Category to create ModMail channels in')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('admin-roles')
                .setDescription('Comma-separated list of admin role IDs who can manage modmail')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Enable or disable the ModMail system')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getChannel('category');
        const adminRoles = interaction.options.getString('admin-roles').split(',');
        const enabled = interaction.options.getBoolean('enabled');

        await setModmailSetup(interaction.guildId, category.id, adminRoles, enabled);

        await interaction.followUp({
            content: `ModMail system configuration saved! ModMail is now **${enabled ? 'enabled' : 'disabled'}**.`,
            ephemeral: true
        });
    }
};
