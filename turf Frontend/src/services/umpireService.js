import api from './api';

export const getUmpireProfile = async () => {
    try {
        const res = await api.get('/umpire/profile');
        if (res && res.success) {
            return res.data;
        }
    } catch (e) {
        console.warn('getUmpireProfile API error:', e.message);
    }
    return null;
};

export const updateUmpireProfile = async (profileData) => {
    try {
        const res = await api.put('/umpire/profile', profileData);
        if (res && res.success) {
            return res;
        }
    } catch (e) {
        console.warn('updateUmpireProfile API error:', e.message);
    }
    return { success: false };
};

export const getUmpireMatches = async () => {
    try {
        const res = await api.get('/umpire/matches');
        if (res && res.success && Array.isArray(res.data)) {
            return res.data;
        }
    } catch (e) {
        console.warn('getUmpireMatches API error:', e.message);
    }
    return [];
};


export const recordToss = async (data) => {
    try {
        const res = await api.post('/umpire/toss', data);
        if (res) return res;
    } catch (e) {
        console.warn('recordToss API error:', e.message);
    }
    return { success: false };
};

export const updateMatchScore = async (data) => {
    try {
        const res = await api.post('/umpire/score', data);
        if (res) return res;
    } catch (e) {
        console.warn('updateMatchScore API error:', e.message);
    }
    return { success: false };
};

export const completeMatch = async (data) => {
    try {
        const res = await api.post('/umpire/complete', data);
        if (res) return res;
    } catch (e) {
        console.warn('completeMatch API error:', e.message);
    }
    return { success: false };
};

export const updatePaymentStatus = async (data) => {
    try {
        const res = await api.post('/umpire/payment-status', data);
        if (res) return res;
    } catch (e) {
        console.warn('updatePaymentStatus API error:', e.message);
    }
    return { success: false };
};

export const registerGroundMatch = async (data) => {
    try {
        const res = await api.post('/umpire/register-ground-match', data);
        if (res) return res;
    } catch (e) {
        console.warn('registerGroundMatch API error:', e.message);
    }
    return { success: false };
};
