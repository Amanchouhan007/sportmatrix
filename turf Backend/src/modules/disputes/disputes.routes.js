const express = require('express');
const {
    getDisputes,
    getDisputeById,
    createDispute,
    updateDisputeStatus,
    resolveDispute,
    getDisputeStats
} = require('./disputes.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();
const requireAdmin = [verifyToken, authorizeRoles(['SUPER_ADMIN'])];

// Stats summary
router.get('/stats', ...requireAdmin, getDisputeStats);

// List all disputes (paginated + filterable)
router.get('/', ...requireAdmin, getDisputes);

// Single dispute detail
router.get('/:id', ...requireAdmin, getDisputeById);

// Create a new dispute -- any authenticated user can raise one
router.post('/', verifyToken, createDispute);

// Update status (OPEN → IN_REVIEW)
router.patch('/:id/status', ...requireAdmin, updateDisputeStatus);

// Resolve dispute with admin notes
router.patch('/:id/resolve', ...requireAdmin, resolveDispute);

module.exports = router;
