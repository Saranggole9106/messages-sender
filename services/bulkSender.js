const { sendTemplateMessage } = require('./whatsappService');
const MessageLog = require('../models/MessageLog');
const Campaign = require('../models/Campaign');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// In-memory store for active campaign progress (used by SSE)
const campaignProgress = new Map();

function getCampaignProgress(campaignId) {
    return campaignProgress.get(campaignId) || null;
}

/**
 * Sends messages to multiple recipients with rate limiting.
 * Updates campaign and message log records in the database.
 */
async function sendBulkMessages(campaignId, contacts, templateName, languageCode, useDemo = false) {
    const delayMs = parseInt(process.env.DELAY_BETWEEN_MESSAGES_MS) || 200;

    const progress = {
        campaignId,
        total: contacts.length,
        current: 0,
        sent: 0,
        failed: 0,
        status: 'running',
        logs: []
    };
    campaignProgress.set(campaignId, progress);

    try {
        // Update campaign status to running
        await Campaign.findByIdAndUpdate(campaignId, {
            status: 'running',
            startedAt: new Date(),
            totalContacts: contacts.length
        });
    } catch (e) { /* demo mode */ }

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const parameters = contact.variables || [];

        let result;
        if (useDemo) {
            // Simulate sending in demo mode (no real API call)
            await delay(100 + Math.random() * 200);
            const success = Math.random() > 0.08; // 92% success rate simulation
            result = {
                success,
                messageId: success ? `wamid.demo_${Date.now()}_${i}` : null,
                status: success ? 'sent' : 'failed',
                error: success ? null : 'Demo: simulated failure'
            };
        } else {
            result = await sendTemplateMessage(contact.phone, templateName, languageCode, parameters);
        }

        if (result.success) {
            progress.sent++;
        } else {
            progress.failed++;
        }
        progress.current = i + 1;

        const logEntry = {
            phone: contact.phone,
            contactName: contact.name || '',
            status: result.status,
            messageId: result.messageId || null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        };
        progress.logs.push(logEntry);

        // Save message log to DB
        try {
            await MessageLog.create({
                campaignId,
                contactId: contact._id || null,
                phone: contact.phone,
                contactName: contact.name || '',
                whatsappMsgId: result.messageId || '',
                templateName,
                status: result.status,
                errorMessage: result.error || '',
                sentAt: result.success ? new Date() : null
            });
        } catch (e) { /* demo mode */ }

        // Update campaign counts
        try {
            await Campaign.findByIdAndUpdate(campaignId, {
                sentCount: progress.sent,
                failedCount: progress.failed
            });
        } catch (e) { /* demo mode */ }

        // Rate limiting delay
        if (i < contacts.length - 1) {
            await delay(delayMs);
        }
    }

    progress.status = 'completed';

    // Finalize campaign
    try {
        await Campaign.findByIdAndUpdate(campaignId, {
            status: 'completed',
            completedAt: new Date(),
            sentCount: progress.sent,
            failedCount: progress.failed
        });
    } catch (e) { /* demo mode */ }

    return progress;
}

module.exports = { sendBulkMessages, getCampaignProgress };
