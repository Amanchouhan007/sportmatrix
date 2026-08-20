const express = require('express');
const { 
    register, 
    login, 
    logout, 
    getProfile, 
    updateProfile, 
    changePassword,
    getAllUsers,
    updateUserStatus
} = require('./auth.controller');
const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Super Admin User Management Routes
router.get('/users', optionalToken, getAllUsers);
router.patch('/users/:id/status', optionalToken, updateUserStatus);

// Protected Profile Routes
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;

