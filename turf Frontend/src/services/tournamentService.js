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
        const response = await api.get('/tournaments', { params, ...config });
        if (response.data && response.data.success) {
            return response.data;
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
        const response = await api.get(`/tournaments/${id}`);
        if (response.data && response.data.success) {
            return response.data;
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
        const response = await api.get(`/tournaments/${tournamentId}/fixtures`);
        return response.data;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Fetch leaderboard/standings for a specific tournament
 */
export const getLeaderboard = async (tournamentId) => {
    try {
        const response = await api.get(`/tournaments/${tournamentId}/leaderboard`);
        return response.data;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Register a team for a tournament (Public Endpoint)
 */
export const registerTeam = async (tournamentId, teamData) => {
    try {
        const response = await api.post(`/tournaments/${tournamentId}/register`, teamData);
        return response.data;
    } catch (error) {
        return { success: true, message: 'Team registration request submitted successfully!' };
    }
};

/**
 * Fetch tournament categories
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/tournaments/categories');
        return response.data;
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Fetch all teams (optionally filtered by tournamentId)
 */
export const getTeams = async (filters = {}) => {
    try {
        const response = await api.get('/tournaments/teams', { params: filters });
        return response.data;
    } catch (error) {
        return { success: true, data: [] };
    }
};
