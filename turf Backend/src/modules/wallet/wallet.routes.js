const express = require('express');
const {
    getWalletBalance,
    getWalletTransactions,
    topUpWallet,
    refundBooking
} = require('./wallet.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// All wallet endpoints require a verified token session
router.use(verifyToken);

router.get('/balance', getWalletBalance);
router.get('/transactions', getWalletTransactions);
router.post('/topup', topUpWallet);

// Booking refunds are limited to Owners & Super-admins
router.post('/refund', authorizeRoles(['OWNER', 'SUPER_ADMIN']), refundBooking);

module.exports = router;
