const mongoose = require('mongoose');

const suggestedSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    suggested: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('suggested', suggestedSchema);