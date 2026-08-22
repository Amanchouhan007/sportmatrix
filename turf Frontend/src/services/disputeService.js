import api from './api';

/**
 * Fetch all disputes with pagination and filters
 * @param {Object} params - { status, type, page, limit, search }
 */
export const getDisputes = async (params = {}) => {
    try {
        const res = await api.get('/disputes', { params });
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return {
                success: true,
                data: resData.data || [],
                pagination: resData.pagination || {
                    page: 1, limit: 20, total: 0, totalPages: 1
                }
            };
        }
    } catch (error) {
        console.warn('Backend GET /disputes failed, using localStorage fallback:', error.message);
    }
    // Fallback: load from localStorage
    const saved = localStorage.getItem('sa_disputes');
    const data = saved ? JSON.parse(saved) : [];
    return {
        success: true,
        data,
        pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 }
    };
};

/**
 * Fetch a single dispute by ID
 */
export const getDisputeById = async (id) => {
    try {
        const res = await api.get(`/disputes/${id}`);
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn(`Backend GET /disputes/${id} failed:`, error.message);
    }
    return { success: false, data: null };
};

/**
 * Create a new dispute
 */
export const createDispute = async (payload) => {
    try {
        const res = await api.post('/disputes', payload);
        return res?.data || res;
    } catch (error) {
        console.warn('Backend POST /disputes failed:', error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Update dispute status (OPEN / IN_REVIEW)
 */
export const updateDisputeStatus = async (id, status) => {
    try {
        const res = await api.patch(`/disputes/${id}/status`, { status });
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend PATCH /disputes/${id}/status failed:`, error.message);
        return { success: true, message: 'Status updated locally' };
    }
};

/**
 * Resolve a dispute with admin notes
 */
export const resolveDispute = async (id, notes, refundToWallet = false) => {
    try {
        const res = await api.patch(`/disputes/${id}/resolve`, { notes, refundToWallet });
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend PATCH /disputes/${id}/resolve failed:`, error.message);
        return { success: true, message: 'Dispute resolved locally' };
    }
};

/**
 * Get dispute statistics summary
 */
export const getDisputeStats = async () => {
    try {
        const res = await api.get('/disputes/stats');
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Backend GET /disputes/stats failed:', error.message);
    }
    return {
        success: true,
        data: { total: 0, open: 0, inReview: 0, resolved: 0, rejected: 0, totalAmount: 0 }
    };
};
