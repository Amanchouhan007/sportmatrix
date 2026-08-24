import api from './api';

// Note: api.js's response interceptor already unwraps to the JSON body
// ({success, data, message}) -- every `res` below IS that body directly.

/** Fetch all advertisements. */
export const getAds = async (params = {}) => {
    const res = await api.get('/ads', { params });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch advertisements.');
    }
    return { success: true, data: res.data || [] };
};

/** Create a new advertisement campaign. */
export const createAd = async (adData) => {
    const res = await api.post('/ads', adData);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create advertisement.');
    }
    return res;
};

/** Update advertisement status (PENDING / APPROVED / ACTIVE / REJECTED / EXPIRED). */
export const updateAdStatus = async (id, status) => {
    const res = await api.patch(`/ads/${id}/status`, { status });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update advertisement status.');
    }
    return res;
};

/** Update advertisement content (name, budget, dates etc.). */
export const updateAd = async (id, adData) => {
    const res = await api.put(`/ads/${id}`, adData);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update advertisement.');
    }
    return res;
};

/** Delete an advertisement. */
export const deleteAd = async (id) => {
    const res = await api.delete(`/ads/${id}`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to delete advertisement.');
    }
    return res;
};

/** Fetch advertisement analytics. */
export const getAdAnalytics = async (params = {}) => {
    const res = await api.get('/ads/analytics', { params });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch advertisement analytics.');
    }
    return res;
};

/** Fetch advertisement payment invoices. */
export const getAdPayments = async (params = {}) => {
    const res = await api.get('/ads/payments', { params });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch advertisement payments.');
    }
    return res;
};

/** Fetch ad commission records. */
export const getAdCommissions = async (params = {}) => {
    const res = await api.get('/ads/commissions', { params });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch ad commissions.');
    }
    return res;
};

/** Mark an ad commission as paid. */
export const markCommissionPaid = async (bookingId) => {
    const res = await api.patch(`/ads/commissions/${bookingId}/pay`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to mark commission as paid.');
    }
    return res;
};
