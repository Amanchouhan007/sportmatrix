const express = require('express');
const {
    getDashboardSummary,
    getRevenueGrowth,
    getCommissionGrowth,
    getTopBranches,
    getRecentActivities
} = require('./dashboard.controller');

const router = express.Router();

// Summary stats
router.get('/summary', getDashboardSummary);

// Revenue growth timeline
router.get('/revenue-growth', getRevenueGrowth);

// Commission earnings growth timeline
router.get('/commission-growth', getCommissionGrowth);

// Top branches stats
router.get('/top-branches', getTopBranches);

// Recent audit activities
router.get('/recent-activities', getRecentActivities);

module.exports = router;
