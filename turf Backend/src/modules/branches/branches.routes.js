const express = require('express');
const {
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    changeBranchStatus,
    deleteBranch,
    getDashboardStats
} = require('./branches.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }
    return verifyToken(req, res, (err) => {
        if (err || res.statusCode >= 400) {
            req.user = null;
            return next();
        }
        return next();
    });
};

router.get('/stats', optionalAuth, getDashboardStats);
router.get('/', optionalAuth, getBranches);
router.get('/:id', optionalAuth, getBranchById);

// Owner / Super Admin restrict routes
router.post('/', optionalAuth, createBranch);
router.put('/:id', optionalAuth, updateBranch);
router.patch('/:id/status', optionalAuth, changeBranchStatus);
router.delete('/:id', optionalAuth, deleteBranch);

module.exports = router;
