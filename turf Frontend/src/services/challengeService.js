import api from './api';

/**
 * Fetch live cricket dare challenges from backend
 */
export const getLiveDareChallenges = async (params = {}) => {
    try {
        const response = await api.get('/match-payments/open-dares', { params });
        return response.data;
    } catch (error) {
        console.warn('Backend getLiveDareChallenges fetch failed:', error.message);
        return { success: false, data: [] };
    }
};
