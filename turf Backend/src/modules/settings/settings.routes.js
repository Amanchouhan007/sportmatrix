const express = require('express');
const { getCommissionSettings, updateCommissionSettings } = require('./settings.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(optionalToken);

router.get('/commission', getCommissionSettings);
router.put('/commission', updateCommissionSettings);

module.exports = router;
