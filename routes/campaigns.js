const express = require('express');
const router = express.Router();
const { sendBulkMessages, getCampaignProgress } = require('../services/bulkSender');
const { v4: uuidv4 } = require('uuid');

let Campaign, MessageLog;
try {
    Campaign = require('../models/Campaign');
    MessageLog = require('../models/MessageLog');
} catch (e) { }

// In-memory campaign store for demo mode
let inMemoryCampaigns = [];

// GET /api/campaigns — List all campaigns
router.get('/', async (req, res) => {
    try {
        if (Campaign && require('mongoose').connection.readyState === 1) {
            const campaigns = await Campaign.find().sort({ createdAt: -1 });
            return res.json({ success: true, campaigns });
        }
    } catch (e) { }
    res.json({ success: true, campaigns: inMemoryCampaigns });
});

// GET /api/campaigns/:id — Get campaign details
router.get('/:id', async (req, res) => {
    try {
        if (Campaign && require('mongoose').connection.readyState === 1) {
            const campaign = await Campaign.findById(req.params.id);
            const logs = await MessageLog.find({ campaignId: req.params.id }).sort({ createdAt: -1 });
            return res.json({ success: true, campaign, logs });
        }
    } catch (e) { }
    const campaign = inMemoryCampaigns.find(c => c._id === req.params.id);
    const progress = getCampaignProgress(req.params.id);
    res.json({ success: true, campaign, logs: progress?.logs || [] });
});

// GET /api/campaigns/:id/progress — Get live campaign progress
router.get('/:id/progress', (req, res) => {
    const progress = getCampaignProgress(req.params.id);
    if (!progress) {
        return res.json({ success: true, status: 'not_found', current: 0, total: 0, sent: 0, failed: 0 });
    }
    res.json({ success: true, ...progress });
});

// POST /api/campaigns — Create and run a campaign
router.post('/', async (req, res) => {
    const { name, templateName, languageCode, contacts, demoMode } = req.body;

    if (!name || !templateName || !contacts || contacts.length === 0) {
        return res.status(400).json({ success: false, error: 'Name, template, and contacts are required.' });
    }

    let campaignId;
    const campaignData = {
        name,
        templateName,
        languageCode: languageCode || 'en',
        status: 'draft',
        totalContacts: contacts.length,
        sentCount: 0,
        failedCount: 0,
        deliveredCount: 0,
        readCount: 0,
        createdAt: new Date()
    };

    try {
        if (Campaign && require('mongoose').connection.readyState === 1) {
            const campaign = await Campaign.create(campaignData);
            campaignId = campaign._id.toString();
        } else {
            throw new Error('demo');
        }
    } catch (e) {
        campaignId = uuidv4();
        campaignData._id = campaignId;
        inMemoryCampaigns.unshift(campaignData);
    }

    res.json({ success: true, campaignId, message: 'Campaign started!' });

    // Run bulk send in background (don't await — fire and forget)
    const useDemo = demoMode !== false; // default to demo mode
    sendBulkMessages(campaignId, contacts, templateName, languageCode || 'en', useDemo)
        .then(result => {
            console.log(`✅ Campaign "${name}" completed: ${result.sent} sent, ${result.failed} failed`);
            const idx = inMemoryCampaigns.findIndex(c => c._id === campaignId);
            if (idx !== -1) {
                inMemoryCampaigns[idx].status = 'completed';
                inMemoryCampaigns[idx].sentCount = result.sent;
                inMemoryCampaigns[idx].failedCount = result.failed;
                inMemoryCampaigns[idx].completedAt = new Date();
            }
        })
        .catch(err => {
            console.error(`❌ Campaign "${name}" failed:`, err);
        });
});

module.exports = router;
