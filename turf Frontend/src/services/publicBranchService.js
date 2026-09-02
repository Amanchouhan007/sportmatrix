import publicApi from './publicApi';

/**
 * Public branch service — uses the unauthenticated publicApi client.
 * Use on public marketplace pages (/, /turfs, /turfs/:id).
 * DO NOT use for Owner/Admin/Staff private operations (use branchService.js instead).
 */

/**
 * Fetch all ACTIVE branches for the public marketplace.
 * @param {Object} filters - Optional: { search, city, page, limit }
 */
export const getPublicBranches = async (filters = {}) => {
    try {
        return await publicApi.get('/public/branches', { params: filters });
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch public branches.');
    }
};

/**
 * Fetch a single ACTIVE branch by ID for the public turf detail page.
 * @param {string} id - Branch ID
 */
export const getPublicBranchById = async (id) => {
    try {
        return await publicApi.get('/public/branches/' + id);
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch branch details.');
    }
};
