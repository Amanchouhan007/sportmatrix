const express = require('express');
const {
    getOverviewReport,
    getRevenueReport,
    getBookingReport,
    getSportsReport,
    getDailyReport,
    getMonthlyReport
} = require('./reports.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Enforce token validation on all reports paths
router.use(verifyToken);

// Restrict reports statistics view ports to Owners and Super-admins
router.use(authorizeRoles(['OWNER', 'SUPER_ADMIN']));

router.get('/overview', getOverviewReport);
router.get('/revenue', getRevenueReport);
router.get('/bookings', getBookingReport);
router.get('/sports', getSportsReport);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
