const express = require('express');
const {
    getTurfs,
    getTurfsNearby,
    searchTurfs,
    filterTurfs
} = require('./turfs.controller');

const router = express.Router();

router.get('/', getTurfs);
router.get('/nearby', getTurfsNearby);
router.get('/search', searchTurfs);
router.get('/filter', filterTurfs);
// Map can just use filter or nearby depending on frontend needs
router.get('/map', getTurfsNearby); 

module.exports = router;
