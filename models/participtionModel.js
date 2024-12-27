const mongoose = require('mongoose');

const participtionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    status: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('particiption', participtionSchema);