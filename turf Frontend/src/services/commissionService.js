import api from './api';

/** Fetch global platform commission settings. */
export const getCommissionSettings = async () => {
    const res = await api.get('/settings/commission');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch commission settings.');
    }
    return res;
};

/** Update global platform commission settings. */
export const updateCommissionSettings = async (payload) => {
    const res = await api.put('/settings/commission', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update commission settings.');
    }
    return res;
};

/** Change commission status. */
export const changeCommissionStatus = async (status) => {
    const res = await api.put('/settings/commission', { status });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update commission status.');
    }
    return res;
};
