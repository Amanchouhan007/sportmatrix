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
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(verifyToken, authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']));

router.get('/commissions', getCommissions);
router.patch('/commissions/:bookingId/pay', markCommissionPaid);
router.get('/analytics', getAdAnalytics);
router.get('/payments', getPayments);

router.get('/', getAdvertisements);
router.post('/', createAdvertisement);
router.put('/:id', updateAdvertisement);
router.patch('/:id/status', updateAdStatus);
router.delete('/:id', deleteAdvertisement);

module.exports = router;
