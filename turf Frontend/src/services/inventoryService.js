import api from './api';

/** List inventory items, branch-scoped automatically for Owner/Staff; Super Admin sees all. */
export const getInventory = async () => {
    const res = await api.get('/inventory');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch inventory.');
    }
    return res;
};

/** Create a new inventory item. */
export const createInventoryItem = async (payload) => {
    const res = await api.post('/inventory', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create inventory item.');
    }
    return res;
};

/** Update an inventory item's name/category/price/threshold. */
export const updateInventoryItem = async (id, payload) => {
    const res = await api.put(`/inventory/${id}`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update inventory item.');
    }
    return res;
};

/** Delete an inventory item. */
export const deleteInventoryItem = async (id) => {
    const res = await api.delete(`/inventory/${id}`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to delete inventory item.');
    }
    return res;
};

/** Restock an item -- increments stock and logs a real PurchaseEntry (supplier, cost). */
export const restockItem = async (id, payload) => {
    const res = await api.post(`/inventory/${id}/restock`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to restock item.');
    }
    return res;
};
