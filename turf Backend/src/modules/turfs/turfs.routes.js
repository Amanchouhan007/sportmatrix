const express = require('express');
const {
    getTurfs,
    getTurfById,
    getTurfsNearby,
    searchTurfs,
    filterTurfs,
    updateTurfMedia
} = require('./turfs.controller');

const router = express.Router();

router.get('/', getTurfs);
router.get('/nearby', getTurfsNearby);
router.get('/search', searchTurfs);
router.get('/filter', filterTurfs);
router.get('/map', getTurfsNearby);
router.get('/:id', getTurfById);
router.put('/:id/media', updateTurfMedia);

module.exports = router;
