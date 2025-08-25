const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-modmails')
        .setDescription('Show all active modmails for this server'),
    
    async execute(interaction) {
        const modmailChannels = interaction.guild.channels.cache.filter(c => c.name.startsWith('modmail-'));
        
        if (modmailChannels.size === 0) {
            return interaction.reply({ content: 'There are no active ModMail conversations.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Active ModMail Conversations')
            .setColor('#00FF00')
            .setDescription(modmailChannels.map(c => `• <#${c.id}> - Created by ${c.name.split('-')[1]}`).join('\n'))
                        .setTimestamp()
            .setFooter({ text: `Server ID: ${interaction.guildId}` })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
