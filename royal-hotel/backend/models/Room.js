const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: 'assets/default-room.jpg' // A default image if none provided
    },
    amenities: {
        type: [String], // Array of strings (e.g., ["WiFi", "AC", "TV"])
        default: []
    },
    capacity: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Room', roomSchema);