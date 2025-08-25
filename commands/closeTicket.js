const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Close the current ticket'),
    async execute(interaction) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: 'You can only use this command in a ticket channel.',
                ephemeral: true,
            });
        }

        await interaction.reply({ content: 'Closing the ticket...' });
        await interaction.channel.delete();  
    },
};
