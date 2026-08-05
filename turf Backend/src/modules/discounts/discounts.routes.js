const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getDiscountOffers,
    getDiscountOfferById,
    createDiscountOffer,
    updateDiscountOffer,
    deleteDiscountOffer,
    changeDiscountStatus,
    duplicateDiscountOffer
} = require('./discounts.controller');
const { validateDiscountOffer } = require('./discounts.validation');

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'discount-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Routes
router.get('/', getDiscountOffers);
router.get('/:id', getDiscountOfferById);
router.post(
    '/',
    upload.fields([
        { name: 'banner', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    validateDiscountOffer,
    createDiscountOffer
);
router.put('/:id', updateDiscountOffer);
router.delete('/:id', deleteDiscountOffer);
router.patch('/:id/status', changeDiscountStatus);
router.post('/:id/duplicate', duplicateDiscountOffer);

module.exports = router;
