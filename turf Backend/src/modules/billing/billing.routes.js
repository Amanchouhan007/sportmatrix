const express = require('express');
const { processPayment, getBillHistory, getPaymentStats, getPaymentLogById, createPaymentLog } = require('./billing.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(optionalToken);

router.post('/pay', processPayment);
router.post('/create-log', createPaymentLog);
router.get('/history', getBillHistory);
router.get('/stats', getPaymentStats);
router.get('/history/:id', getPaymentLogById);

module.exports = router;
