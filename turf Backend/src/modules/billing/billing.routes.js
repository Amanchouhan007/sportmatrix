const express = require('express');
const { processPayment, getBillHistory } = require('./billing.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Publicly protect routes for active authenticated sessions
router.use(verifyToken);

router.post('/pay', authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']), processPayment);
router.get('/history', authorizeRoles(['OWNER', 'SUPER_ADMIN']), getBillHistory);

module.exports = router;
