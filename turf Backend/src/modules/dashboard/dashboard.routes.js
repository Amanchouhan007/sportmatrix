const express = require('express');
const { getDashboardSummary } = require('./dashboard.controller');
const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/summary', optionalToken, getDashboardSummary);

module.exports = router;
