const express = require('express');
const {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    toggleStatus,
    togglePopular
} = require('./subscriptions.controller');

const {
    validateCreatePlan,
    validateUpdatePlan
} = require('./subscriptions.validation');

const router = express.Router();

// List all plans
router.get('/', getAllPlans);

// Get single plan by ID
router.get('/:id', getPlanById);

// Create plan
router.post('/', validateCreatePlan, createPlan);

// Update plan
router.put('/:id', validateUpdatePlan, updatePlan);

// Delete plan
router.delete('/:id', deletePlan);

// Toggle status
router.patch('/:id/status', toggleStatus);

// Toggle popular
router.patch('/:id/popular', togglePopular);

module.exports = router;
