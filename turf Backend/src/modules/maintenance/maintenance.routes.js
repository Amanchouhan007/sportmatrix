const express = require('express');
const { getTickets, createTicket, updateTicketStatus, deleteTicket } = require('./maintenance.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(optionalToken);

router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id', updateTicketStatus);
router.delete('/tickets/:id', deleteTicket);

module.exports = router;
