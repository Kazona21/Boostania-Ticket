const mongoose = require('mongoose');


const ticketSetupSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  
    ticketChannelId: { type: String },          
    adminRoleIds: { type: [String], required: true }, 
    ticketSystemEnabled: { type: Boolean, default: false },  
    createdAt: { type: Date, default: Date.now }
});

const TicketSetup = mongoose.model('TicketSetup', ticketSetupSchema);


async function setTicketSetup(guildId, ticketChannelId, adminRoleIds, ticketSystemEnabled) {
    const setup = await TicketSetup.findOneAndUpdate(
        { guildId },
        {
            guildId,
            ticketChannelId,
            adminRoleIds,
            ticketSystemEnabled
        },
        { upsert: true, new: true }
    );
    return setup;
}

async function getTicketSetup(guildId) {
    return await TicketSetup.findOne({ guildId });
}

module.exports = {
    TicketSetup,
    setTicketSetup,
    getTicketSetup
};
