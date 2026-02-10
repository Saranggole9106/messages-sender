const express = require('express');
const router = express.Router();

let MessageLog;
try { MessageLog = require('../models/MessageLog'); } catch (e) { }

// GET /webhook — Verify webhook (required by Meta)
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        console.log('✅ Webhook verified');
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// POST /webhook — Receive delivery status updates from Meta
router.post('/', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                const value = change.value;

                // Handle status updates (sent, delivered, read, failed)
                if (value.statuses) {
                    for (const status of value.statuses) {
                        console.log(`📨 Status update: ${status.id} → ${status.status}`);
                        try {
                            if (MessageLog) {
                                const update = { status: status.status };
                                if (status.status === 'delivered') update.deliveredAt = new Date(status.timestamp * 1000);
                                if (status.status === 'read') update.readAt = new Date(status.timestamp * 1000);

                                await MessageLog.findOneAndUpdate(
                                    { whatsappMsgId: status.id },
                                    update
                                );
                            }
                        } catch (e) {
                            console.error('Failed to update message status:', e.message);
                        }
                    }
                }

                // Handle incoming messages (for chatbot / auto-reply)
                if (value.messages) {
                    for (const message of value.messages) {
                        console.log(`💬 Incoming message from ${message.from}: ${message.text?.body || '[media]'}`);
                        // TODO: Implement auto-reply/chatbot logic here
                    }
                }
            }
        }
    }

    res.sendStatus(200);
});

module.exports = router;
