const express = require('express');
const {
    createBooking,
    cancelBooking,
    getUpcomingBookings,
    getBookingHistory,
    getBookingLedgerSummary,
    updateBookingStatus,
    createGuestBooking,
    lookupGuestBookingsByPhone
} = require('./bookings.controller');

const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

// Guest booking routes (Public)
router.post('/guest', createGuestBooking);
router.get('/guest-lookup', lookupGuestBookingsByPhone);

router.get('/summary', optionalToken, getBookingLedgerSummary);
router.put('/:id/status', optionalToken, updateBookingStatus);

router.post('/', optionalToken, createBooking);
router.post('/:id/cancel', optionalToken, cancelBooking);
router.get('/upcoming', optionalToken, getUpcomingBookings);
router.get('/history', optionalToken, getBookingHistory);
router.get('/', optionalToken, getBookingHistory);

module.exports = router;

