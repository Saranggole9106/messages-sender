const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const contactsRouter = require('./routes/contacts');
const campaignsRouter = require('./routes/campaigns');
const templatesRouter = require('./routes/templates');
const webhookRouter = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/templates', templatesRouter);
app.use('/webhook', webhookRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        mongoConnected: require('mongoose').connection.readyState === 1
    });
});

// Serve dashboard for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║   🟢 WhatsApp Bulk Messaging Platform                ║');
        console.log('║                                                       ║');
        console.log(`║   🌐 Dashboard:  http://localhost:${PORT}              ║`);
        console.log(`║   📡 API:        http://localhost:${PORT}/api           ║`);
        console.log(`║   🔗 Webhook:    http://localhost:${PORT}/webhook       ║`);
        console.log('║                                                       ║');
        console.log('║   📖 Running in DEMO mode (no real API calls)         ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log('');
    });
}

start();
