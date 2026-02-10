const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();

// Try to use the Mongoose model; fallback to in-memory for demo
let Contact;
try { Contact = require('../models/Contact'); } catch (e) { }

// In-memory store for demo mode
let inMemoryContacts = [];
let contactIdCounter = 1;

const upload = multer({ dest: 'uploads/' });

// GET /api/contacts — List all contacts
router.get('/', async (req, res) => {
    try {
        if (Contact && require('mongoose').connection.readyState === 1) {
            const contacts = await Contact.find({ status: 'active' }).sort({ createdAt: -1 });
            return res.json({ success: true, contacts, count: contacts.length });
        }
    } catch (e) { }
    // Demo fallback
    res.json({ success: true, contacts: inMemoryContacts, count: inMemoryContacts.length });
});

// POST /api/contacts — Add a single contact
router.post('/', async (req, res) => {
    const { phone, name, email, variables, tags } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    const contactData = {
        phone: cleanPhone,
        name: name || 'Unknown',
        email: email || '',
        variables: variables || [],
        tags: tags || [],
        optedIn: true,
        optedInAt: new Date(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        if (Contact && require('mongoose').connection.readyState === 1) {
            const contact = await Contact.create(contactData);
            return res.json({ success: true, contact });
        }
    } catch (e) {
        if (e.code === 11000) return res.status(400).json({ success: false, error: 'Contact already exists' });
    }

    // Demo fallback
    contactData._id = `demo_${contactIdCounter++}`;
    const existing = inMemoryContacts.find(c => c.phone === cleanPhone);
    if (existing) return res.status(400).json({ success: false, error: 'Contact already exists' });
    inMemoryContacts.push(contactData);
    res.json({ success: true, contact: contactData });
});

// POST /api/contacts/upload — Upload CSV of contacts
router.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const contacts = [];
    const errors = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            const phone = (row.phone || row.Phone || row.PHONE || '').replace(/[^0-9]/g, '');
            if (phone.length >= 10 && phone.length <= 15) {
                const vars = [];
                // Collect variable columns (variable1, variable2, ... or var1, var2, ...)
                for (let k = 1; k <= 10; k++) {
                    const val = row[`variable${k}`] || row[`var${k}`] || row[`Variable${k}`];
                    if (val) vars.push(val);
                }
                contacts.push({
                    _id: `demo_${contactIdCounter++}`,
                    phone,
                    name: row.name || row.Name || row.NAME || 'Unknown',
                    email: row.email || row.Email || '',
                    variables: vars,
                    tags: (row.tags || row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
                    optedIn: (row.opted_in || row.optedIn || 'true').toLowerCase() === 'true',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                errors.push({ row, reason: 'Invalid phone number' });
            }
        })
        .on('end', async () => {
            const validContacts = contacts.filter(c => c.optedIn);
            const skipped = contacts.length - validContacts.length;

            try {
                if (Contact && require('mongoose').connection.readyState === 1) {
                    for (const c of validContacts) {
                        delete c._id;
                        try { await Contact.create(c); } catch (e) { }
                    }
                } else {
                    inMemoryContacts.push(...validContacts);
                }
            } catch (e) {
                inMemoryContacts.push(...validContacts);
            }

            // Clean up uploaded file
            try { fs.unlinkSync(req.file.path); } catch (e) { }

            res.json({
                success: true,
                imported: validContacts.length,
                skipped,
                errors: errors.length,
                message: `${validContacts.length} contacts imported. ${skipped} skipped (no opt-in). ${errors.length} invalid rows.`
            });
        })
        .on('error', (err) => {
            res.status(500).json({ success: false, error: 'Failed to parse CSV: ' + err.message });
        });
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
    try {
        if (Contact && require('mongoose').connection.readyState === 1) {
            await Contact.findByIdAndDelete(req.params.id);
            return res.json({ success: true });
        }
    } catch (e) { }
    inMemoryContacts = inMemoryContacts.filter(c => c._id !== req.params.id);
    res.json({ success: true });
});

// Export the in-memory contacts for use in campaigns
router.getInMemoryContacts = () => inMemoryContacts;

module.exports = router;
