import api from './api';

/**
 * Register a new holiday calendar block
 */
export const createHoliday = async (payload) => {
    try {
        const response = await api.post('/holidays', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to register holiday.');
    }
};

/**
 * Fetch calendar block holidays lists for a specific branch
 */
export const getHolidays = async (params = {}) => {
    try {
        const response = await api.get('/holidays', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to list holidays.');
    }
};

/**
 * Delete a holiday calendar block
 */
export const deleteHoliday = async (id) => {
    try {
        const response = await api.delete(`/holidays/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete holiday.');
    }
};
