const db = require('../../config/db');

/**
 * Get branch inventory items list formatted for UI grids and lists
 */
const getInventory = async (req, res) => {
    const { branchId } = req.query;

    try {
        const ownerFilter = req.query.ownerId || req.query.owner_id || (req.user?.role === 'OWNER' ? req.user.id : null);
        const emailFilter = req.query.email || req.user?.email;

        let query = 'SELECT * FROM inventory WHERE 1=1';
        const params = [];
        if (branchId) {
            query += ' AND branch_id = ?';
            params.push(branchId);
        } else if (req.user?.role === 'OWNER' || (ownerFilter && ownerFilter !== 'ALL')) {
            query += ' AND (branch_id IN (SELECT id FROM branches WHERE owner_id = ? OR owner_id IN (SELECT id FROM owners WHERE email = ? OR user_id = ? OR id = ?) OR email = ?))';
            params.push(ownerFilter || '', emailFilter || '', ownerFilter || '', ownerFilter || '', emailFilter || '');
        }
        query += ' ORDER BY item_name ASC';
        const [rows] = await db.query(query, params);

        const formatted = rows.map(r => {
            const stock = r.stock_quantity;
            const threshold = r.min_stock_alert;
            const totalValue = stock * r.price;

            let status = 'In Stock';
            if (stock <= 0) {
                status = 'Out of Stock';
            } else if (stock < threshold) {
                status = 'Low Stock';
            }

            return {
                id: r.id,
                _id: r.id,
                name: r.item_name,
                category: r.category,
                stock,
                threshold,
                price: r.price,
                value: `₹${totalValue.toLocaleString()}`,
                status
            };
        });

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch inventory error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching inventory.'
        });
    }
};

/**
 * Create a new inventory item
 */
const createInventoryItem = async (req, res) => {
    const { branchId, name, category, stock, price, threshold } = req.body;

    if (!branchId || !name || !price) {
        return res.status(400).json({
            success: false,
            message: 'branchId, name, and price are required fields.'
        });
    }

    try {
        const itemId = 'item_' + Date.now();
        await db.query(`
            INSERT INTO inventory (id, branch_id, item_name, category, stock_quantity, min_stock_alert, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            itemId,
            branchId,
            name,
            category || 'Equipment',
            stock || 0,
            threshold || 5,
            price
        ]);

        return res.status(201).json({
            success: true,
            message: 'Inventory item added successfully.',
            data: { id: itemId, name }
        });
    } catch (error) {
        console.error('Create inventory item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error creating item.'
        });
    }
};

/**
 * Update inventory details
 */
const updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { name, category, price, threshold } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM inventory WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found.'
            });
        }

        await db.query(`
            UPDATE inventory 
            SET 
                item_name = COALESCE(?, item_name),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                min_stock_alert = COALESCE(?, min_stock_alert)
            WHERE id = ?
        `, [name, category, price, threshold, id]);

        return res.status(200).json({
            success: true,
            message: 'Inventory item updated successfully.'
        });
    } catch (error) {
        console.error('Update inventory item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating item.'
        });
    }
};

/**
 * Remove an item from inventory catalog
 */
const deleteInventoryItem = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully.'
        });
    } catch (error) {
        console.error('Delete inventory item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting item.'
        });
    }
};

/**
 * Restock inventory items (Purchase Entry)
 */
const restockItem = async (req, res) => {
    const { id } = req.params; // Inventory Item ID
    const { quantity, cost, supplier } = req.body;

    if (!quantity || Number(quantity) <= 0 || !cost) {
        return res.status(400).json({
            success: false,
            message: 'quantity (greater than zero) and cost are required fields.'
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verify item existence
        const [items] = await connection.query('SELECT id, stock_quantity FROM inventory WHERE id = ? FOR UPDATE', [id]);
        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found.'
            });
        }

        const newQty = items[0].stock_quantity + Number(quantity);

        // 2. Increment stock count
        await connection.query('UPDATE inventory SET stock_quantity = ? WHERE id = ?', [newQty, id]);

        // 3. Log purchase entry history
        await connection.query(`
            INSERT INTO purchase_entries (inventory_id, quantity, purchase_cost, supplier)
            VALUES (?, ?, ?, ?)
        `, [id, Number(quantity), cost, supplier || 'General Distributor']);

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: 'Restocking purchase entry logged successfully.',
            data: {
                newStockQuantity: newQty
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Restocking transaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error processing restock.'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockItem
};
