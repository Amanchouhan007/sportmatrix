import api from './api';

/**
 * Tournament Service — API Layer for Customer-Facing Tournament Features
 */

/**
 * Fetch public tournaments list (only Approved/Active/Completed)
 */
export const getPublicTournaments = async (filters = {}) => {
    try {
        const params = { role: 'CUSTOMER', ...filters };
        const response = await api.get('/tournaments', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tournaments.');
    }
};

/**
 * Fetch single tournament details by ID
 */
export const getTournamentById = async (id) => {
    try {
        const response = await api.get(`/tournaments/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tournament details.');
    }
};

/**
 * Fetch fixtures/matches for a specific tournament
 */
export const getFixtures = async (tournamentId) => {
    try {
        const response = await api.get(`/tournaments/${tournamentId}/fixtures`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch fixtures.');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard.');
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
        throw new Error(error.response?.data?.message || 'Failed to register team.');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch teams.');
    }
};
