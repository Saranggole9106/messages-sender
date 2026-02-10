const express = require('express');
const router = express.Router();
const { getTemplates } = require('../services/whatsappService');

// Demo templates for when the API isn't configured
const DEMO_TEMPLATES = [
    {
        id: 'tmpl_001',
        name: 'order_confirmation',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        body: 'Hi {{1}}, your order #{{2}} has been confirmed! Expected delivery: {{3}}.',
        variables: ['Customer Name', 'Order ID', 'Delivery Date'],
        variableCount: 3
    },
    {
        id: 'tmpl_002',
        name: 'shipping_update',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        body: 'Hello {{1}}, your order #{{2}} has been shipped! Track it here: {{3}}',
        variables: ['Customer Name', 'Order ID', 'Tracking URL'],
        variableCount: 3
    },
    {
        id: 'tmpl_003',
        name: 'payment_reminder',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        body: 'Dear {{1}}, your payment of ₹{{2}} is due on {{3}}. Please pay on time to avoid late fees.',
        variables: ['Customer Name', 'Amount', 'Due Date'],
        variableCount: 3
    },
    {
        id: 'tmpl_004',
        name: 'otp_verification',
        category: 'AUTHENTICATION',
        language: 'en',
        status: 'APPROVED',
        body: 'Your verification code is {{1}}. Valid for 5 minutes. Do not share this code.',
        variables: ['OTP Code'],
        variableCount: 1
    },
    {
        id: 'tmpl_005',
        name: 'appointment_reminder',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        body: 'Hi {{1}}, this is a reminder that your appointment is on {{2}} at {{3}}. Reply CONFIRM to confirm.',
        variables: ['Customer Name', 'Date', 'Time'],
        variableCount: 3
    },
    {
        id: 'tmpl_006',
        name: 'promotional_offer',
        category: 'MARKETING',
        language: 'en',
        status: 'APPROVED',
        body: '🎉 Hi {{1}}! Exciting offer just for you — Flat {{2}}% OFF! Use code: {{3}}. Shop now: {{4}}',
        variables: ['Customer Name', 'Discount %', 'Coupon Code', 'Shop URL'],
        variableCount: 4
    },
    {
        id: 'tmpl_007',
        name: 'welcome_message',
        category: 'MARKETING',
        language: 'en',
        status: 'APPROVED',
        body: 'Welcome to {{1}}, {{2}}! We are thrilled to have you on board. Explore our latest offerings at {{3}}.',
        variables: ['Company Name', 'Customer Name', 'Website URL'],
        variableCount: 3
    },
    {
        id: 'tmpl_008',
        name: 'feedback_request',
        category: 'MARKETING',
        language: 'en',
        status: 'APPROVED',
        body: 'Hi {{1}}, thank you for shopping with us! We would love your feedback on order #{{2}}. Rate us: {{3}}',
        variables: ['Customer Name', 'Order ID', 'Feedback URL'],
        variableCount: 3
    }
];

// GET /api/templates — List all templates
router.get('/', async (req, res) => {
    // Try to fetch real templates from WhatsApp API
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_ACCESS_TOKEN !== 'your_access_token_here') {
        const result = await getTemplates();
        if (result.success && result.templates.length > 0) {
            const templates = result.templates.map(t => ({
                id: t.id,
                name: t.name,
                category: t.category,
                language: t.language,
                status: t.status,
                body: t.components?.find(c => c.type === 'BODY')?.text || '',
                variableCount: (t.components?.find(c => c.type === 'BODY')?.text?.match(/\{\{\d+\}\}/g) || []).length
            }));
            return res.json({ success: true, templates, source: 'api' });
        }
    }

    // Return demo templates
    res.json({ success: true, templates: DEMO_TEMPLATES, source: 'demo' });
});

module.exports = router;
