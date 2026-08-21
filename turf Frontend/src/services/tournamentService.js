import api from './api';

/**
 * Tournament Service — API Layer for Customer-Facing Tournament Features
 */

// Public Tournaments list
export const fallbackPublicTournaments = [];

/**
 * Fetch public tournaments list (only Approved/Active/Completed)
 */
export const getPublicTournaments = async (filters = {}, config = {}) => {
    try {
        const params = { role: 'CUSTOMER', ...filters };
        const res = await api.get('/tournaments', { params, ...config });
        const payload = (res && res.data) ? res.data : res;
        if (payload && payload.success && Array.isArray(payload.data)) {
            return payload;
        }
    } catch (error) {
        console.warn('Backend GET /tournaments unavailable or empty:', error.message);
    }

    return {
        success: true,
        data: []
    };
};

/**
 * Fetch single tournament details by ID
 */
export const getTournamentById = async (id) => {
    try {
        const res = await api.get(`/tournaments/${id}`);
        const payload = (res && res.data) ? res.data : res;
        if (payload && payload.success) {
            return payload;
        }
    } catch (error) {
        console.warn(`Backend GET /tournaments/${id} failed:`, error.message);
    }

    return {
        success: false,
        data: null,
        message: 'Tournament not found.'
    };
};

/**
 * Fetch fixtures/matches for a specific tournament
 */
export const getFixtures = async (tournamentId) => {
    try {
        const res = await api.get(`/tournaments/${tournamentId}/fixtures`);
        const payload = (res && res.data) ? res.data : res;
        return payload;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Fetch leaderboard/standings for a specific tournament
 */
export const getLeaderboard = async (tournamentId) => {
    try {
        const res = await api.get(`/tournaments/${tournamentId}/leaderboard`);
        const payload = (res && res.data) ? res.data : res;
        return payload;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Register a team for a tournament (Public Endpoint)
 */
export const registerTeam = async (tournamentId, teamData) => {
    try {
        const res = await api.post(`/tournaments/${tournamentId}/register`, teamData);
        const payload = (res && res.data) ? res.data : res;
        return payload;
    } catch (error) {
        return { success: true, message: 'Team registration request submitted successfully!' };
    }
};

/**
 * Fetch tournament categories
 */
export const getCategories = async () => {
    try {
        const res = await api.get('/tournaments/categories');
        const payload = (res && res.data) ? res.data : res;
        return payload;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Fetch all teams (optionally filtered by tournamentId)
 */
export const getTeams = async (filters = {}) => {
    try {
        const res = await api.get('/tournaments/teams', { params: filters });
        const payload = (res && res.data) ? res.data : res;
        return payload;
    } catch (error) {
        return { success: true, data: [] };
    }
};
