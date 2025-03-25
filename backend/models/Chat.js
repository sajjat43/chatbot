const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['system', 'user', 'assistant']
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

// Add indexes for better query performance
chatSchema.index({ timestamp: -1 });
chatSchema.index({ role: 1 });

module.exports = mongoose.model('Chat', chatSchema); 