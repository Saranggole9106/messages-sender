<div align="center">

  # 🚀 WhatsApp Bulk Messaging Platform
  
  <a href="https://github.com/Saranggole9106/messages-sender">
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=whatsapp" alt="Status" />
  </a>
  <a href="https://github.com/Saranggole9106/messages-sender/issues">
    <img src="https://img.shields.io/github/issues/Saranggole9106/messages-sender?style=for-the-badge&logo=github" alt="Issues" />
  </a>
  <a href="https://github.com/Saranggole9106/messages-sender/stargazers">
    <img src="https://img.shields.io/github/stars/Saranggole9106/messages-sender?style=for-the-badge&logo=github" alt="Stars" />
  </a>
  <a href="https://github.com/Saranggole9106/messages-sender/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </a>

  <br />
  <br />

  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTM3YjI3a3Z5bnZ5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z5/xT9IgzoKnwFNmISR8I/giphy.gif" alt="WhatsApp Messaging Animation" width="100%">

  <h3 align="center">Send thousands of messages via Meta's Official Cloud API with a stunning dashboard.</h3>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-configuration">Configuration</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## ⚡ Features

| Feature | Description |
| :--- | :--- |
| **🚀 Bulk Messaging** | Send thousands of messages with intelligent rate limiting and queue management. |
| **📝 Smart Templates** | Use pre-approved Meta templates with variable mapping (`{{1}}`, `{{2}}`). |
| **👥 Contact Manager** | Upload CSV files, manage contacts, and tag users for targeted campaigns. |
| **📊 Live Dashboard** | Real-time campaign tracking with a beautiful dark-mode UI. |
| **📋 Message Logs** | Detailed delivery reports (Sent, Delivered, Read, Failed) via Webhooks. |
| **🔬 Demo Mode** | Test the entire flow without API credentials using the built-in simulator. |
| **🛡️ Compliance Ready** | Built-in opt-in management to keep your number safe from bans. |

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,html,css,js&theme=dark" />
</div>

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Optional - falls back to in-memory)
- **Frontend:** Vanilla JS, HTML5, CSS3 (Glassmorphism UI)
- **API:** Meta WhatsApp Business Cloud API

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Saranggole9106/messages-sender.git
cd messages-sender
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

Visit the dashboard at: **`http://localhost:3000`**

---

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Server Config
PORT=3000
NODE_ENV=development

# WhatsApp API Credentials (Get from Meta Developers)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Webhook Verification
WEBHOOK_VERIFY_TOKEN=your_secure_token

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/whatsapp_bulk

# Rate Limiting
MESSAGES_PER_SECOND=10
DELAY_BETWEEN_MESSAGES_MS=200
```

---

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x400/1a1f35/ffffff?text=Admin+Dashboard+Preview" alt="Dashboard" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

> *The dashboard features a modern, responsive design with dark mode support.*

---

## 📡 API Documentation

<details>
<summary><strong>👆 Click to expand API Endpoints</strong></summary>

| Method | Endpoint | Description | Body / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check server status | - |
| `GET` | `/api/contacts` | Get all contacts | - |
| `POST` | `/api/contacts` | Add a contact | `{ phone, name, email }` |
| `POST` | `/api/contacts/upload` | Upload CSV | `FormData: csvFile` |
| `GET` | `/api/campaigns` | Get all campaigns | - |
| `POST` | `/api/campaigns` | Create campaign | `{ name, templateName, contacts }` |
| `GET` | `/api/templates` | Fetch templates | - |

</details>

---

## ☁️ Deployment

<div align="center">

  <a href="https://render.com/deploy">
    <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
  </a>

  <a href="https://railway.app/new">
    <img src="https://railway.app/button.svg" alt="Deploy on Railway" />
  </a>

</div>

### Steps to Deploy on Render:
1. Fork this repo.
2. Sign up on [Render.com](https://render.com).
3. Create a **New &rarr; Web Service**.
4. Connect this repo.
5. Add the Environment Variables from `.env`.
6. Click **Deploy**! 🚀

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Saranggole9106">Sarang Gole</a></p>
  <p>
    <img src="https://visitor-badge.laobi.icu/badge?page_id=Saranggole9106.messages-sender" alt="Visitors" />
  </p>
</div>
