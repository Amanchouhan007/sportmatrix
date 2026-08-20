const express = require('express');
const { getLeads, createLead, deleteLead, broadcastOffer } = require('./crm.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(optionalToken);

router.get('/leads', getLeads);
router.post('/leads', createLead);
router.delete('/leads/:id', deleteLead);
router.post('/broadcast', broadcastOffer);

module.exports = router;
