const express = require('express');
const router = express.Router();
const { db, now } = require('../firebaseConfig');
const { sendContactEmail } = require('../utils/mailer');

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });

        // Save to Firestore
        await db.collection('contacts').add({ name, email, phone: phone || '', subject: subject || 'General Enquiry', message, isRead: false, createdAt: now() });

        // Send email notification
        sendContactEmail({ name, email, phone, subject, message }).catch(err => console.error('Email error:', err.message));

        res.json({ message: 'Message received. We will contact you soon!' });
    } catch (err) {
        console.error('Contact error:', err.message);
        res.status(500).json({ message: 'Error sending message' });
    }
});

module.exports = router;
