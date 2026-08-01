const express = require('express');
const { getDashboardSummary } = require('./dashboard.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Enforce token validation on all dashboard paths
router.use(verifyToken);

// Dashboard is restricted to management staff, owners, and super-admins
router.get('/summary', authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']), getDashboardSummary);

module.exports = router;
