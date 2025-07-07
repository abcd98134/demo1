const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// POST a new booking
router.post('/', async (req, res) => {
    const { roomId, checkInDate, checkOutDate, numberOfGuests, guestName, guestEmail } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Basic check for availability (you'd need more complex logic for overlapping bookings)
        if (!room.isAvailable) {
            return res.status(400).json({ message: 'Room is not available for booking.' });
        }

        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);

        // Calculate number of nights
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
        }

        const totalPrice = diffDays * room.pricePerNight;

        const booking = new Booking({
            roomId,
            checkInDate: startDate,
            checkOutDate: endDate,
            numberOfGuests,
            guestName,
            guestEmail,
            totalPrice
        });

        const newBooking = await booking.save();

        // Optionally, update room availability after booking (more robust for real apps)
        // await Room.findByIdAndUpdate(roomId, { isAvailable: false }); // Or manage specific dates

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET all bookings (for admin, later)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('roomId'); // Populate to get room details
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;