const express = require('express');
const {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockItem
} = require('./inventory.controller');

const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalToken, getInventory);
router.post('/', optionalToken, createInventoryItem);
router.put('/:id', optionalToken, updateInventoryItem);
router.delete('/:id', optionalToken, deleteInventoryItem);
router.post('/:id/restock', optionalToken, restockItem);

module.exports = router;
