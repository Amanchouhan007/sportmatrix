const express = require('express');
const router = express.Router();
const corporateController = require('./corporate.controller');

// Public route: Submit corporate booking proposal
router.post('/proposals', corporateController.createCorporateProposal);

// Admin/Owner routes: View, update and manage corporate proposals
router.get('/proposals', corporateController.getAllCorporateProposals);
router.get('/proposals/:id', corporateController.getCorporateProposalById);
router.patch('/proposals/:id/status', corporateController.updateProposalStatus);
router.patch('/proposals/:id/quote', corporateController.updateCorporateQuote);
router.delete('/proposals/:id', corporateController.deleteCorporateProposal);

module.exports = router;
