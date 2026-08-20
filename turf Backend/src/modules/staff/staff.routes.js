const express = require('express');
const { getStaff, createStaff, deleteStaff } = require('./staff.controller');
const { optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();
router.use(optionalToken);

router.get('/', getStaff);
router.post('/', createStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
