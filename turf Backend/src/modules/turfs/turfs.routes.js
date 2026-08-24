const express = require('express');
const {
    getTurfs,
    getTurfById,
    getTurfsNearby,
    searchTurfs,
    filterTurfs,
    updateTurfMedia
} = require('./turfs.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public catalog -- no auth required
router.get('/', getTurfs);
router.get('/nearby', getTurfsNearby);
router.get('/search', searchTurfs);
router.get('/filter', filterTurfs);
router.get('/map', getTurfsNearby);
router.get('/:id', getTurfById);

// Owner/Admin mutation
router.put('/:id/media', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateTurfMedia);

module.exports = router;
