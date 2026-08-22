const express = require('express');
const {
    getAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    updateAdStatus,
    deleteAdvertisement,
    getCommissions,
    markCommissionPaid,
    getPayments,
    getAdAnalytics
} = require('./ads.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/commissions', optionalToken, getCommissions);
router.patch('/commissions/:bookingId/pay', optionalToken, markCommissionPaid);
router.get('/analytics', optionalToken, getAdAnalytics);
router.get('/payments', optionalToken, getPayments);

router.get('/', optionalToken, getAdvertisements);
router.post('/', optionalToken, createAdvertisement);
router.put('/:id', optionalToken, updateAdvertisement);
router.patch('/:id/status', optionalToken, updateAdStatus);
router.delete('/:id', optionalToken, deleteAdvertisement);

module.exports = router;
