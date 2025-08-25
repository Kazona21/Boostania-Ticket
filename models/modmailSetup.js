const mongoose = require('mongoose');

const modmailSetupSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  
    modmailCategoryId: { type: String },         
    modmailSystemEnabled: { type: Boolean, default: false },  
    adminRoleIds: { type: [String], required: true }, 
    createdAt: { type: Date, default: Date.now }
});

const ModmailSetup = mongoose.model('ModmailSetup', modmailSetupSchema);

async function setModmailSetup(guildId, modmailCategoryId, adminRoleIds, modmailSystemEnabled) {
    const setup = await ModmailSetup.findOneAndUpdate(
        { guildId },
        {
            guildId,
            modmailCategoryId,
            adminRoleIds,
            modmailSystemEnabled
        },
        { upsert: true, new: true }
    );
    return setup;
}

async function getModmailSetup(guildId) {
    return await ModmailSetup.findOne({ guildId });
}

module.exports = {
    ModmailSetup,
    setModmailSetup,
    getModmailSetup
};
