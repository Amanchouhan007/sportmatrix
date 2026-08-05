const express = require('express');
const {
    getAdvertisements,
    createAdvertisement,
    updateAdStatus,
    deleteAdvertisement,
    getCommissions,
    markCommissionPaid
} = require('./ads.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/commissions', optionalToken, getCommissions);
router.patch('/commissions/:bookingId/pay', optionalToken, markCommissionPaid);

router.get('/', optionalToken, getAdvertisements);
router.post('/', optionalToken, createAdvertisement);
router.patch('/:id/status', optionalToken, updateAdStatus);
router.delete('/:id', optionalToken, deleteAdvertisement);

module.exports = router;
