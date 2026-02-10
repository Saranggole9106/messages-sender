const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'Unknown' },
    email: { type: String, default: '' },
    variables: [{ type: String }],
    tags: [{ type: String }],
    optedIn: { type: Boolean, default: false },
    optedInAt: { type: Date },
    status: { type: String, enum: ['active', 'blocked', 'unsubscribed'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

contactSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Contact', contactSchema);
