const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    templateName: { type: String, required: true },
    languageCode: { type: String, default: 'en' },
    status: { type: String, enum: ['draft', 'running', 'paused', 'completed', 'failed'], default: 'draft' },
    totalContacts: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    contactFilter: { type: Object, default: {} },
    contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

campaignSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
