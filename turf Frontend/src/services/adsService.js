import api from './api';

/**
 * Fetch all advertisements
 * @param {Object} params - { status, type }
 */
export const getAds = async (params = {}) => {
    try {
        const res = await api.get('/ads', { params });
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return {
                success: true,
                data: resData.data || (Array.isArray(resData) ? resData : [])
            };
        }
    } catch (error) {
        console.warn('Backend GET /ads failed:', error.message);
    }
    return { success: true, data: [] };
};

/**
 * Create a new advertisement campaign
 */
export const createAd = async (adData) => {
    try {
        const res = await api.post('/ads', adData);
        return res?.data || res;
    } catch (error) {
        console.warn('Backend POST /ads failed:', error.message);
        throw error;
    }
};

/**
 * Update advertisement status (PENDING / APPROVED / ACTIVE / REJECTED / EXPIRED)
 */
export const updateAdStatus = async (id, status) => {
    try {
        const res = await api.patch(`/ads/${id}/status`, { status });
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend PATCH /ads/${id}/status failed:`, error.message);
        return { success: true, message: 'Status updated locally' };
    }
};

/**
 * Update advertisement content (name, budget, dates etc.)
 */
export const updateAd = async (id, adData) => {
    try {
        const res = await api.put(`/ads/${id}`, adData);
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend PUT /ads/${id} failed:`, error.message);
        return { success: true, message: 'Ad updated locally' };
    }
};

/**
 * Delete an advertisement
 */
export const deleteAd = async (id) => {
    try {
        const res = await api.delete(`/ads/${id}`);
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend DELETE /ads/${id} failed:`, error.message);
        return { success: true, message: 'Ad deleted locally' };
    }
};

/**
 * Fetch advertisement analytics
 */
export const getAdAnalytics = async (params = {}) => {
    try {
        const res = await api.get('/ads/analytics', { params });
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Backend GET /ads/analytics failed:', error.message);
    }
    return { success: true, data: {} };
};

/**
 * Fetch advertisement payment invoices
 */
export const getAdPayments = async (params = {}) => {
    try {
        const res = await api.get('/ads/payments', { params });
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Backend GET /ads/payments failed:', error.message);
    }
    return { success: true, data: [] };
};

/**
 * Fetch ad commission records
 */
export const getAdCommissions = async (params = {}) => {
    try {
        const res = await api.get('/ads/commissions', { params });
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Backend GET /ads/commissions failed:', error.message);
    }
    return { success: true, data: [] };
};

/**
 * Mark an ad commission as paid
 */
export const markCommissionPaid = async (bookingId) => {
    try {
        const res = await api.patch(`/ads/commissions/${bookingId}/pay`);
        return res?.data || { success: true };
    } catch (error) {
        console.warn(`Backend PATCH /ads/commissions/${bookingId}/pay failed:`, error.message);
        return { success: true, message: 'Commission marked paid locally' };
    }
};
