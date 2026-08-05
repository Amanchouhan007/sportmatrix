const express = require('express');
const {
    getMasterSports,
    getBranchSports,
    activateBranchSport,
    updateBranchSport,
    changeSportStatus,
    deleteBranchSport,
    uploadSportImage
} = require('./sports.controller');

const { verifyToken, optionalToken, authorizeRoles } = require('../../middleware/auth.middleware');
const upload = require('../../config/multer.config');

const router = express.Router();

// Public / Authenticated user routes (Customers can view sports too)
router.get('/master', getMasterSports);
router.get('/branch/:branchId', getBranchSports);

// Owner / Admin configuration routes
router.post('/branch', optionalToken, activateBranchSport);
router.put('/branch/:id', optionalToken, updateBranchSport);
router.patch('/branch/:id/status', optionalToken, changeSportStatus);
router.delete('/branch/:id', optionalToken, deleteBranchSport);

// Image Upload Endpoint (Multer integration)
router.post('/upload', verifyToken, authorizeRoles(['OWNER', 'SUPER_ADMIN']), upload.single('image'), uploadSportImage);

module.exports = router;
