const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    message: {
        type: String,
        maxLength: 512,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('comment', commentSchema);