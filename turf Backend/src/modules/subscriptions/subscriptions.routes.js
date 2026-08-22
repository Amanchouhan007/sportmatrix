const express = require('express');
const {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    toggleStatus,
    togglePopular,
    purchaseSubscription,
    getSubscriptionPurchases
} = require('./subscriptions.controller');

const {
    validateCreatePlan,
    validateUpdatePlan
} = require('./subscriptions.validation');

const router = express.Router();

// List all plans
router.get('/', getAllPlans);

// Purchase a subscription plan (Creates owner_subscription purchase record)
router.post('/buy', purchaseSubscription);
router.post('/purchase', purchaseSubscription);

// Get all subscription purchases
router.get('/purchases', getSubscriptionPurchases);

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
