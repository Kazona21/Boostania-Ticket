const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Icons = require('../UI/Icons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Support server of this Bot'),
    async execute(interaction) {
        const supportServerLink = "https://discord.gg/cqJkPppmD5";
        const replitLink = "https://e-z.bio/kazona";


        const embed = new EmbedBuilder()
            .setColor('#b300ff')
            .setAuthor({
                name: 'Support Server',
                iconURL: Icons.dotIcon,
                url: 'https://discord.gg/xQF9f9yUEM'
            })
            .setDescription(`➡️ **Join our Discord server for support and updates:**\n- Discord - ${supportServerLink}\n- Contact - ${replitLink}`)
            .setImage('https://cdn.discordapp.com/attachments/1398296723985666089/1409168070102220871/41e7cd8a-5926-4c44-9cec-0181d66fb6d2.png?ex=68ad0e48&is=68abbcc8&hm=cad31b247b1ff2bca9f940c2b0779b3f140955c8584a7fe95ad98a9816fafef9&')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
