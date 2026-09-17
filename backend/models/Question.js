const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    madhhab: {
        type: String,
        enum: ["Shafi'i", "Hanafi", "Maliki", "Hanbali", "General / No Preference"],
        required: true,
    },
    isUrgent: {
        type: Boolean,
        default: false,
    },
    questionText: {
        type: String,
        required: true,
    },
    answerText: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'Answered'],
        default: 'Pending',
    },
    comments: [{
        name: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Question', questionSchema);
