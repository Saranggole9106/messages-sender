# 💬 WhatsApp Bulk Messaging Platform

A full-stack WhatsApp Bulk Messaging Platform built with **Meta's Official WhatsApp Business Cloud API**.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🚀 **Bulk Messaging** — Send thousands of messages with rate limiting
- 📝 **Template Management** — 8 pre-built templates with WhatsApp phone preview
- 👥 **Contact Management** — CSV upload, search, tags, opt-in tracking
- 📊 **Campaign Dashboard** — Create, launch & track campaigns with live progress
- 📋 **Message Logs** — Per-message delivery status (sent/delivered/read/failed)
- 🔗 **Webhook Integration** — Real-time delivery status updates from Meta
- 🔬 **Demo Mode** — Test everything without real API credentials
- 📱 **Responsive Design** — Premium dark-mode dashboard

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/whatsapp-bulk-messenger.git
cd whatsapp-bulk-messenger

# Install dependencies
npm install

# Start the server
node server.js
```

Open **http://localhost:3000** in your browser.

## 🔧 Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
MONGODB_URI=mongodb://localhost:27017/whatsapp_bulk
```

> Works without MongoDB too — falls back to in-memory storage in demo mode.

## 📂 Project Structure

```
├── server.js              # Express server
├── config/database.js     # MongoDB connection
├── models/                # Mongoose schemas
├── services/              # WhatsApp API & bulk sender
├── routes/                # REST API endpoints
├── public/                # Admin dashboard (HTML/CSS/JS)
└── sample_contacts.csv    # Test data
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Add a contact |
| POST | `/api/contacts/upload` | Upload CSV |
| GET | `/api/templates` | List templates |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create & launch campaign |
| GET | `/api/campaigns/:id/progress` | Live progress |
| POST | `/webhook` | Meta webhook receiver |

## ⚖️ Compliance

- ✅ Uses only Meta's **Official WhatsApp Business Cloud API**
- ✅ Requires user opt-in before messaging
- ✅ Supports opt-out (STOP/unsubscribe)
- ❌ No WhatsApp Web scraping or unofficial APIs

## 📄 License

MIT License — Free to use, modify, and distribute.

---

> Built with ❤️ using Node.js, Express & the WhatsApp Cloud API
