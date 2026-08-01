const express = require('express');
const { register, login, logout, getProfile } = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Routes
router.get('/me', verifyToken, getProfile);

module.exports = router;
