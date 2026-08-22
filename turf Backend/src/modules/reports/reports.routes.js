const express = require('express');
const {
    getOverviewReport,
    getRevenueReport,
    getBookingReport,
    getUserAnalyticsReport,
    getSubscriptionAnalyticsReport,
    getTopOwnersReport,
    getTopBranchesReport,
    getSportsReport,
    getDailyReport,
    getMonthlyReport,
    exportReport
} = require('./reports.controller');

const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(optionalToken);

router.get('/overview', getOverviewReport);
router.get('/revenue', getRevenueReport);
router.get('/bookings', getBookingReport);
router.get('/users', getUserAnalyticsReport);
router.get('/subscriptions', getSubscriptionAnalyticsReport);
router.get('/top-owners', getTopOwnersReport);
router.get('/top-branches', getTopBranchesReport);
router.get('/sports', getSportsReport);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/export', exportReport);

module.exports = router;
