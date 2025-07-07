const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single room by ID
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new room (for admin, later)
router.post('/', async (req, res) => {
    const room = new Room({
        name: req.body.name,
        description: req.body.description,
        pricePerNight: req.body.pricePerNight,
        imageUrl: req.body.imageUrl,
        amenities: req.body.amenities,
        capacity: req.body.capacity,
        isAvailable: req.body.isAvailable
    });
    try {
        const newRoom = await room.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// You can add PUT and DELETE routes for rooms as well

module.exports = router;