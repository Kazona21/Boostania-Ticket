
const { getTicketSetup } = require('../models/ticketSetup');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Icons = require('../UI/Icons');
module.exports = async (client) => {
    client.on('ready', () => {
        setInterval(async () => {
            const guilds = client.guilds.cache;

            for (const guild of guilds.values()) {
                try {
                    const setup = await getTicketSetup(guild.id);
                    if (!setup || !setup.ticketSystemEnabled) continue;

                    const channel = guild.channels.cache.get(setup.ticketChannelId);
                    if (!channel) {
                        //console.warn(`No channel found for ID ${setup.ticketChannelId} in guild ${guild.id}`);
                        continue;
                    }

                    if (channel.type !== ChannelType.GuildText) {
                        //console.warn(`Channel ${channel.id} is not a text channel.`);
                        continue;
                    }

                    const existingMessages = await channel.messages.fetch({ limit: 1 });
                    if (existingMessages.size === 0) {
                        const embed = new EmbedBuilder()
                        .setAuthor({
                            name: "Ticket System",
                            iconURL: Icons.ticketIcon,
                            url: "https://discord.gg/cqJkPppmD5"
                        })
                        .setDescription('- Please click the button below to create a new ticket.\n\n' +
                            '**Ticket Rules:**\n' +
                            '- Vui Lòng Nói Yêu Cầu Của Các Bạn Khi Tạo Ticket\n' +
                            '- Hãy Chờ Đội Ngũ Hỗ Trợ Xử Lý Yêu Cầu Của Bạn\n' +
                            '- Không Spam Trong Ticket\n'
                        )
                        .setImage('https://cdn.discordapp.com/attachments/1398296723985666089/1409168070102220871/41e7cd8a-5926-4c44-9cec-0181d66fb6d2.png?ex=68ad0e48&is=68abbcc8&hm=cad31b247b1ff2bca9f940c2b0779b3f140955c8584a7fe95ad98a9816fafef9&')
                        .setFooter({ text: 'Boostania Ticket Bot!', iconURL: Icons.modIcon })
                        .setColor('#00FF00'); 
                        

                        const button = new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('Open Ticket')
                            .setStyle(ButtonStyle.Primary);

                        const row = new ActionRowBuilder().addComponents(button);

                        try {
                            await channel.send({ embeds: [embed], components: [row] });
                            //console.log(`Sent ticket setup message in channel ${channel.id} of guild ${guild.id}`);
                        } catch (sendError) {
                            //console.error(`Error sending message in channel ${channel.id} of guild ${guild.id}:`, sendError);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing guild ${guild.id}:`, error);
                }
            }
        }, 10000);
    });

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton()) {
            if (interaction.customId === 'create_ticket') {
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal')
                    .setTitle('Create a Support Ticket');

                const subjectInput = new TextInputBuilder()
                    .setCustomId('ticket_subject')
                    .setLabel('Subject of your Ticket')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('ticket_description')
                    .setLabel('Description of your Issue')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const firstActionRow = new ActionRowBuilder().addComponents(subjectInput);
                const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

                modal.addComponents(firstActionRow, secondActionRow);

                // Show the modal to the user
                await interaction.showModal(modal);
            }
        }

      
      if (interaction.isModalSubmit()) {
            if (interaction.customId === 'ticket_modal') {
                // Defer the reply to avoid "Unknown interaction" errors
                await interaction.deferReply({ ephemeral: true });

                const subject = interaction.fields.getTextInputValue('ticket_subject');
                const description = interaction.fields.getTextInputValue('ticket_description');

                const setup = await getTicketSetup(interaction.guildId);
                const existingTicket = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username}`);
                if (existingTicket) {
                    return await interaction.followUp({ content: 'You already have an open ticket! If not please contact staff.', ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['ViewChannel'] },
                        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                        ...setup.adminRoleIds.map(roleId => ({
                            id: roleId, allow: ['ViewChannel', 'SendMessages']
                        }))
                    ]
                });

                const openEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: "Ticket Created Successfully",
                        iconURL: Icons.tickIcon,
                        url: "https://discord.gg/cqJkPppmD5"
                    })
                    .setDescription(`Your ticket channel: ${ticketChannel.url}`)
                    .setFooter({ text: 'Boostania Ticket', iconURL: Icons.modIcon })
                    .setColor('#00FF00'); 

                await interaction.user.send({ embeds: [openEmbed] });

                const embed = new EmbedBuilder()
                    .setTitle(`Sub: ${subject}`)
                    .setDescription(description)
                    .setColor('#FFFF00')
                    .setFooter({ text: `Created by ${interaction.user.username}` });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('ping_admin').setLabel('Ping Admin').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('ticket_info').setLabel('Ticket Info').setStyle(ButtonStyle.Primary)
                    );

                await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

                await interaction.followUp({ content: 'Your ticket has been created!', ephemeral: true });
            }
        }


        if (interaction.isButton()) {
            if (interaction.customId === 'close_ticket') {
                if (!interaction.channel.name.startsWith('ticket-')) {
                    return await interaction.reply({ content: 'You can only use this command in a ticket channel.', ephemeral: true });
                }

                await interaction.reply({ content: 'Closing the ticket...' });
                await interaction.channel.delete();
            } else if (interaction.customId === 'ping_admin') {
                const setup = await getTicketSetup(interaction.guildId);
                const adminRoleMentions = setup.adminRoleIds.map(roleId => `<@&${roleId}>`).join(', ');
                await interaction.channel.send(`- Attention ${adminRoleMentions}! A user has requested assistance in this ticket.`);
                await interaction.reply({ content: 'Admins have been notified.', ephemeral: true });
            } else if (interaction.customId === 'ticket_info') {
                const embed = new EmbedBuilder()
                    .setTitle(`Ticket Information`)
                    .setDescription(`Ticket created by: <@${interaction.user.id}>`)
                    .addFields({ name: 'Ticket Channel:', value: interaction.channel.name })
                    .setColor('#00FF00');

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    });
};
