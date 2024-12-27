const mongoose = require('mongoose');

const { contactValidationSchema } = require('./schema/contactSchema');

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        maxLength: 150
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        maxLength: 500
    },
    ipAddress : {
        type : String,
    },
    status: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

contactSchema.statics.contactValidation = function (body) {
    return contactValidationSchema.validate(body, { abortEarly: false });
}

module.exports = mongoose.model('contact', contactSchema);