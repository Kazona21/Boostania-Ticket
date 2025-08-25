const mongoose = require('mongoose');
const config = require('./config.js');

async function connectToDatabase() {
    try {
        await mongoose.connect(config.mongodbURI);
        console.log('\x1b[31m[ CORE ]\x1b[0m \x1b[32m%s\x1b[0m', 'Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = { connectToDatabase };