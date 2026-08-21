import api from './api';

/**
 * Register a new branch
 */
export const createBranch = async (branchData) => {
    try {
        const response = await api.post('/branches', branchData);
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create branch.');
    }
};

/**
 * List branches with filters
 */
export const getBranches = async (filters = {}) => {
    try {
        const response = await api.get('/branches', { params: filters });
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to list branches.');
    }
};

/**
 * Get details of a single branch by ID
 */
export const getBranchById = async (id) => {
    try {
        const response = await api.get(`/branches/${id}`);
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch branch details.');
    }
};

/**
 * Update branch metadata settings
 */
export const updateBranch = async (id, branchData) => {
    try {
        const response = await api.put(`/branches/${id}`, branchData);
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to update branch.');
    }
};

/**
 * Toggle branch status (ACTIVE/INACTIVE)
 */
export const changeBranchStatus = async (id, status) => {
    try {
        const response = await api.patch(`/branches/${id}/status`, { status });
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to update branch status.');
    }
};

/**
 * Delete a branch
 */
export const deleteBranch = async (id) => {
    try {
        const response = await api.delete(`/branches/${id}`);
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete branch.');
    }
};

/**
 * Fetch branch statistics count summary
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/branches/stats');
        return response.data || response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard stats.');
    }
};
