const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'brokers',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    screenName: {
        type: String
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });   

var notificationModel = mongoose.model('notifications', notificationSchema);
module.exports = { notificationModel };