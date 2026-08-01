const express = require('express');
const {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockItem
} = require('./inventory.controller');

const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Enforce token checks on all inventory paths
router.use(verifyToken);

router.get('/', getInventory);

// Configurations reserved for Owner, Staff, or Super Admin
router.post('/', authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']), createInventoryItem);
router.put('/:id', authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']), updateInventoryItem);
router.delete('/:id', authorizeRoles(['OWNER', 'SUPER_ADMIN']), deleteInventoryItem);

// Restocking Purchase Entry route
router.post('/:id/restock', authorizeRoles(['OWNER', 'STAFF', 'SUPER_ADMIN']), restockItem);

module.exports = router;
