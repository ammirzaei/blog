const mongoose = require('mongoose');

const { postValidationSchema } = require('./schema/PostSchema');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 150
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 1000
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'عمومی',
        enum: ['عمومی', 'خصوصی']
    },
    image: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

blogSchema.index({ title: 'text' });

blogSchema.statics.postValidation = function (body) {
    return postValidationSchema.validate(body, { abortEarly: false });
}

module.exports = mongoose.model('blog', blogSchema);