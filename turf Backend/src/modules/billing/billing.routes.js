const express = require('express');
const { processPayment, getBillHistory } = require('./billing.controller');
const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/pay', optionalToken, processPayment);
router.get('/history', optionalToken, getBillHistory);

module.exports = router;
