const express = require('express');
const {
    getWalletBalance,
    getWalletTransactions,
    topUpWallet,
    refundBooking
} = require('./wallet.controller');

const { optionalToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Allow reading wallet balance with optional session token
router.get('/me', optionalToken, getWalletBalance);
router.get('/balance', optionalToken, getWalletBalance);
router.get('/transactions', optionalToken, getWalletTransactions);
router.post('/topup', optionalToken, topUpWallet);

// Booking refunds are limited to Owners & Super-admins
router.post('/refund', optionalToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), refundBooking);

module.exports = router;
