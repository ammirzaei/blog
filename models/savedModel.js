const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('saved', savedSchema);