/**
 * MatchPaymentRoutes
 * Express router mapping all Team Match Payment Engine endpoints.
 */

const express = require('express');
const router = express.Router();
const MatchPaymentController = require('./matchPayment.controller');

// Match Booking & Slot Holds
router.post('/create', MatchPaymentController.createMatchBooking);
router.post('/verify', MatchPaymentController.verifyPayment);

// Invites & Share Payments
router.get('/invite/:token', MatchPaymentController.getInviteDetails);
router.post('/invite/:token/pay', MatchPaymentController.payInviteShare);
router.post('/invite/:token/decline', MatchPaymentController.declineInvite);

// Scores & Disputes
router.post('/:id/submit-score', MatchPaymentController.submitMatchScore);

// Cancellation Policy Quotes
router.get('/:id/cancellation-quote', MatchPaymentController.getCancellationQuote);

// Admin Match Payment Controls & Dispute Resolution
router.get('/admin/overview', MatchPaymentController.getAdminMatchPayments);
router.get('/admin/disputes', MatchPaymentController.getDisputedMatches);
router.post('/admin/resolve-dispute', MatchPaymentController.resolveDispute);

module.exports = router;
