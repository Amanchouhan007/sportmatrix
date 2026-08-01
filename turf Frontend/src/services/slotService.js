import api from './api';

/**
 * Register a new custom slot
 */
export const createSlot = async (payload) => {
    try {
        const response = await api.post('/slots', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create slot.');
    }
};

/**
 * Fetch slots based on query parameters (branchId, date, sportId, courtName)
 */
export const getSlots = async (params = {}) => {
    try {
        const response = await api.get('/slots', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch slots.');
    }
};

/**
 * Get slot details by ID
 */
export const getSlotById = async (id) => {
    try {
        const response = await api.get(`/slots/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch slot detail.');
    }
};

/**
 * Update slot pricing or court details
 */
export const updateSlot = async (id, payload) => {
    try {
        const response = await api.put(`/slots/${id}`, payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update slot.');
    }
};

/**
 * Update slot status (AVAILABLE, BOOKED, BLOCKED, COMPLETED)
 */
export const updateSlotStatus = async (id, status, notes = '') => {
    try {
        const response = await api.patch(`/slots/${id}/status`, { status, notes });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update slot status.');
    }
};

/**
 * Delete a slot
 */
export const deleteSlot = async (id) => {
    try {
        const response = await api.delete(`/slots/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete slot.');
    }
};
