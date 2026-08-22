const express = require('express');
const {
    getDisputes,
    getDisputeById,
    createDispute,
    updateDisputeStatus,
    resolveDispute,
    getDisputeStats
} = require('./disputes.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(optionalToken);

// Stats summary
router.get('/stats', getDisputeStats);

// List all disputes (paginated + filterable)
router.get('/', getDisputes);

// Single dispute detail
router.get('/:id', getDisputeById);

// Create a new dispute
router.post('/', createDispute);

// Update status (OPEN → IN_REVIEW)
router.patch('/:id/status', updateDisputeStatus);

// Resolve dispute with admin notes
router.patch('/:id/resolve', resolveDispute);

module.exports = router;
