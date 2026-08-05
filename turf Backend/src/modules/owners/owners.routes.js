const express = require('express');
const upload = require('../../config/multer.config');
const {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    changeOwnerStatus,
    deleteOwner
} = require('./owners.controller');

const {
    validateCreateOwner,
    validateUpdateOwner
} = require('./owners.validation');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * Middleware to handle image upload supporting both 'profile_image' and 'profileImage' field names
 */
const handleProfileImageUpload = (req, res, next) => {
    const uploadSingle = upload.fields([
        { name: 'profile_image', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 }
    ]);

    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading profile image'
            });
        }
        // Normalize single file to req.file
        if (req.files) {
            const file = (req.files['profile_image'] && req.files['profile_image'][0]) ||
                         (req.files['profileImage'] && req.files['profileImage'][0]);
            if (file) {
                req.file = file;
            }
        }
        next();
    });
};

// Owner REST Endpoints

// List all owners & Get owner by ID (Accessible or Restricted to Admins)
router.get('/', getOwners);
router.get('/:id', getOwnerById);

// Create Owner (Supports Profile Image upload)
router.post('/', handleProfileImageUpload, validateCreateOwner, createOwner);

// Update Owner (Supports Profile Image upload)
router.put('/:id', handleProfileImageUpload, validateUpdateOwner, updateOwner);

// Status Toggle
router.patch('/:id/status', changeOwnerStatus);

// Delete Owner
router.delete('/:id', deleteOwner);

module.exports = router;
