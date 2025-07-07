const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST a new contact message
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({
        name,
        email,
        subject,
        message
    });

    try {
        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;