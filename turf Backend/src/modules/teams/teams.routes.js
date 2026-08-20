const express = require('express');
const { getTeams, createTeam } = require('./teams.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(optionalToken);

router.get('/', getTeams);
router.post('/', createTeam);

module.exports = router;
