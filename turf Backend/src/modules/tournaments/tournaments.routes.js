const express = require('express');
const {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    registerTeam,
    getBracketSchedule
} = require('./tournaments.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Publicly readable endpoints (customers can register teams & view schedules)
router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/schedule', getBracketSchedule);
router.post('/:id/register', registerTeam);

// Owner / Super Admin tournament configuration endpoints
router.post('/', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), createTournament);
router.put('/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateTournament);
router.delete('/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), deleteTournament);

module.exports = router;
