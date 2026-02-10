const axios = require('axios');
require('dotenv').config();

/**
 * Sends a single WhatsApp template message to one recipient
 * via Meta's WhatsApp Business Cloud API.
 */
async function sendTemplateMessage(phoneNumber, templateName, languageCode, parameters) {
    try {
        const components = [];
        if (parameters && parameters.length > 0) {
            components.push({
                type: 'body',
                parameters: parameters.map(param => ({
                    type: 'text',
                    text: String(param)
                }))
            });
        }

        const response = await axios.post(
            `${process.env.WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components: components
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            messageId: response.data.messages[0].id,
            status: 'sent'
        };
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error(`❌ Failed to send to ${phoneNumber}: ${errMsg}`);
        return {
            success: false,
            error: errMsg,
            status: 'failed'
        };
    }
}

/**
 * Fetches all approved message templates from the WhatsApp Business Account.
 */
async function getTemplates() {
    try {
        const response = await axios.get(
            `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
                }
            }
        );
        return { success: true, templates: response.data.data || [] };
    } catch (error) {
        console.error('❌ Failed to fetch templates:', error.response?.data || error.message);
        return { success: false, templates: [], error: error.message };
    }
}

module.exports = { sendTemplateMessage, getTemplates };
