const express = require('express');
const {
    createBooking,
    cancelBooking,
    getUpcomingBookings,
    getBookingHistory
} = require('./bookings.controller');

const { verifyToken } = require('../../middleware/auth.middleware');

const router = express.Router();

// All booking routes require a verified token context session
router.use(verifyToken);

router.post('/', createBooking);
router.post('/:id/cancel', cancelBooking);
router.get('/upcoming', getUpcomingBookings);
router.get('/history', getBookingHistory);

module.exports = router;
