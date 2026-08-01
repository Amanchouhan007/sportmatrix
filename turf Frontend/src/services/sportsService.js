import api from './api';

/**
 * Get all global master sports
 */
export const getMasterSports = async () => {
    try {
        const response = await api.get('/sports/master');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch master sports.');
    }
};

/**
 * Get all configured sports for a specific branch
 */
export const getBranchSports = async (branchId) => {
    try {
        const id = branchId || 'br_001';
        const response = await api.get(`/sports/branch/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch branch sports.');
    }
};

/**
 * Get sport configuration by ID
 */
export const getSportById = async (id) => {
    try {
        const res = await getBranchSports();
        const sport = res.data.find(s => s.id === id || s._id === id);
        return { success: true, data: sport };
    } catch (error) {
        throw new Error('Failed to fetch sport by ID.');
    }
};

/**
 * Activate a master sport for a branch
 */
export const activateSport = async (payload) => {
    try {
        const response = await api.post('/sports/branch', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to activate sport.');
    }
};

/**
 * Update a branch sport configuration
 */
export const updateSport = async (id, payload) => {
    try {
        const response = await api.put(`/sports/branch/${id}`, payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update sport.');
    }
};

/**
 * Toggle branch sport availability status
 */
export const changeSportStatus = async (id, status) => {
    try {
        const response = await api.patch(`/sports/branch/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update status.');
    }
};

/**
 * Remove a sport configuration from a branch
 */
export const deleteSport = async (id) => {
    try {
        const response = await api.delete(`/sports/branch/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete sport.');
    }
};
