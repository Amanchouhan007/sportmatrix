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

// Allow public listing of branches (needed for login/signup selectors)
router.get('/', getBranches);
router.get('/stats', getDashboardStats);
router.get('/:id', getBranchById);

// Owner / Super Admin restrict routes
router.post('/', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), createBranch);
router.put('/:id', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), updateBranch);
router.patch('/:id/status', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), changeBranchStatus);
router.delete('/:id', verifyToken, authorizeRoles(['SUPER_ADMIN']), deleteBranch);

module.exports = router;
