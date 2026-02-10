const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    phone: { type: String, required: true },
    contactName: { type: String, default: '' },
    whatsappMsgId: { type: String, default: '' },
    templateName: { type: String },
    status: { type: String, enum: ['queued', 'sent', 'delivered', 'read', 'failed'], default: 'queued' },
    errorMessage: { type: String, default: '' },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

messageLogSchema.index({ campaignId: 1, status: 1 });
messageLogSchema.index({ whatsappMsgId: 1 });

module.exports = mongoose.model('MessageLog', messageLogSchema);
