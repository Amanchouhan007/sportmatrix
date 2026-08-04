const express = require('express');
const {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    approveTournament,
    rejectTournament,
    suspendTournament,
    deleteTournament,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    registerTeam,
    getTeams,
    updateTeamStatus,
    generateFixtures,
    getFixtures,
    updateMatchScore,
    getLeaderboard,
    getSponsors,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    getTournamentPayments,
    getTournamentReports,
    getSettings,
    updateSettings
} = require('./tournaments.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Publicly readable endpoints (Customers, Public visitors)
router.get('/', getTournaments);
router.get('/categories', getCategories);
router.get('/sponsors', getSponsors);
router.get('/payments', getTournamentPayments);
router.get('/reports', getTournamentReports);
router.get('/settings', getSettings);
router.get('/teams', getTeams);
router.get('/:id', getTournamentById);
router.get('/:id/fixtures', getFixtures);
router.get('/:id/leaderboard', getLeaderboard);
router.post('/:id/register', registerTeam);

// Staff & Owner Creation / Editing Endpoints
router.post('/', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN', 'STAFF']), createTournament);
router.put('/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN', 'STAFF']), updateTournament);

// Owner-Only Approval & Control Flow Endpoints
router.post('/:id/approve', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), approveTournament);
router.post('/:id/reject', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), rejectTournament);
router.post('/:id/suspend', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), suspendTournament);
router.delete('/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), deleteTournament);

// Category Management (Owner)
router.post('/categories', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), createCategory);
router.put('/categories/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateCategory);
router.delete('/categories/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), deleteCategory);

// Sponsor Management (Owner)
router.post('/sponsors', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), createSponsor);
router.put('/sponsors/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateSponsor);
router.delete('/sponsors/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), deleteSponsor);

// Team Registration Management (Staff & Owner)
router.put('/teams/:teamId/status', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN', 'STAFF']), updateTeamStatus);

// Fixture Generation & Match Score Updates (Staff & Owner)
router.post('/:id/generate-fixtures', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN', 'STAFF']), generateFixtures);
router.put('/matches/:matchId/score', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN', 'STAFF']), updateMatchScore);

// Settings Update (Owner)
router.put('/settings', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateSettings);

module.exports = router;
