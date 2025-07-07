require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- ADD THESE LINES FOR DEBUGGING ---
console.log('Attempting to connect to MONGO_URI:', MONGO_URI);
if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is undefined! Please check your .env file and its location.");
    process.exit(1); // Exit the process if URI is missing
}
// --- END DEBUGGING LINES ---

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON requests

// Route imports
const roomsRouter = require('./routes/rooms');
const bookingRouter = require('./routes/booking');
const contactRouter = require('./routes/contact'); // Optional

// Use routes
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/contact', contactRouter); // Optional

// Basic route for home
app.get('/', (req, res) => {
    res.send('Welcome to the Royal Hotel Backend API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});