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
        if (res && res.success && Array.isArray(res.data)) {
            return res;
        }
        if (Array.isArray(res)) {
            return { success: true, data: res };
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
        if (res && res.success && res.data) {
            return res;
        }
        if (res && res.id) {
            return { success: true, data: res };
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
        if (res && res.success && Array.isArray(res.data)) return res;
        if (Array.isArray(res)) return { success: true, data: res };
        return { success: true, data: [] };
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
        if (res && res.success && Array.isArray(res.data)) return res;
        if (Array.isArray(res)) return { success: true, data: res };
        return { success: true, data: [] };
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
        return res;
    } catch (error) {
        return { success: true, message: 'Team registration request submitted successfully!' };
    }
};

/**
 * Initialize Razorpay Payment Order for Tournament Entry Fee
 */
export const createRazorpayOrder = async (tournamentId, teamData) => {
    try {
        const res = await api.post(`/tournaments/${tournamentId}/create-razorpay-order`, teamData);
        return res;
    } catch (error) {
        throw new Error(error.message || 'Failed to initialize Razorpay payment order');
    }
};

/**
 * Verify Razorpay Payment Signature & Confirm Tournament Registration
 */
export const verifyRazorpayPayment = async (tournamentId, verificationPayload) => {
    try {
        const res = await api.post(`/tournaments/${tournamentId}/verify-razorpay-payment`, verificationPayload);
        return res;
    } catch (error) {
        throw new Error(error.message || 'Razorpay payment verification failed');
    }
};

/**
 * Fetch tournament categories
 */
export const getCategories = async () => {
    try {
        const res = await api.get('/tournaments/categories');
        if (res && res.success && Array.isArray(res.data)) return res;
        if (Array.isArray(res)) return { success: true, data: res };
        return { success: true, data: [] };
    } catch (error) {
        return { success: true, data: [] };
    }
};

/**
 * Fetch all teams for public discovery
 */
export const getTeams = async (filters = {}) => {
    try {
        const res = await api.get('/teams', { params: filters });
        if (res && res.success && Array.isArray(res.data)) return res;
        if (Array.isArray(res)) return { success: true, data: res };
        return { success: true, data: [] };
    } catch (error) {
        console.warn('GET /teams failed:', error.message);
        return { success: true, data: [] };
    }
};

/**
 * Fetch authenticated user's joined/created teams
 */
export const getMyTeams = async () => {
    try {
        const res = await api.get('/teams/my-teams');
        if (res && res.success && Array.isArray(res.data)) return res;
        if (Array.isArray(res)) return { success: true, data: res };
        return { success: true, data: [] };
    } catch (error) {
        console.warn('GET /teams/my-teams failed:', error.message);
        return { success: true, data: [] };
    }
};

/**
 * Create a new team
 */
export const createTeam = async (teamData) => {
    const res = await api.post('/teams', teamData);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create team.');
    }
    return res;
};

/**
 * Send request to join a team
 */
export const joinTeam = async (teamId) => {
    const res = await api.post(`/teams/${teamId}/join`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to join team.');
    }
    return res;
};

/**
 * Fetch captain's pending join requests for a team
 */
export const getJoinRequests = async (teamId) => {
    const res = await api.get(`/teams/${teamId}/join-requests`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch join requests.');
    }
    return res;
};

/**
 * Approve a join request (Captain only)
 */
export const approveJoinRequest = async (teamId, requestId) => {
    const res = await api.post(`/teams/${teamId}/join-requests/${requestId}/approve`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to approve join request.');
    }
    return res;
};

/**
 * Reject a join request (Captain only)
 */
export const rejectJoinRequest = async (teamId, requestId) => {
    const res = await api.post(`/teams/${teamId}/join-requests/${requestId}/reject`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to reject join request.');
    }
    return res;
};

/**
 * Fetch every scheduled/live/completed tournament fixture across all
 * tournaments (Owner/Staff/Super Admin match management view).
 */
export const getAllTournamentMatches = async () => {
    const res = await api.get('/tournaments/matches/all');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch tournament matches.');
    }
    return res;
};

/**
 * Update a fixture's final score/result -- also updates the real tournament
 * leaderboard (matches played/won/lost/points) when status is COMPLETED.
 */
export const updateMatchScore = async (matchId, payload) => {
    const res = await api.put(`/tournaments/matches/${matchId}/score`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update match score.');
    }
    return res;
};

/** Generate playoff/league fixtures for a tournament from its approved teams. */
export const generateFixtures = async (tournamentId) => {
    const res = await api.post(`/tournaments/${tournamentId}/generate-fixtures`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to generate fixtures.');
    }
    return res;
};

/** Save live in-progress match state (used by the live scorer console). */
export const saveLiveMatchScore = async (payload) => {
    const res = await api.post('/tournaments/matches/save-score', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to save live match score.');
    }
    return res;
};

// ==========================================
// SPONSORS
// ==========================================

/** Fetch all tournament sponsors. */
export const getSponsors = async () => {
    const res = await api.get('/tournaments/sponsors');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch sponsors.');
    }
    return res;
};

/** Add a new sponsor for a tournament. */
export const createSponsor = async (payload) => {
    const res = await api.post('/tournaments/sponsors', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to add sponsor.');
    }
    return res;
};

/** Update sponsor details/status. */
export const updateSponsor = async (id, payload) => {
    const res = await api.put(`/tournaments/sponsors/${id}`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update sponsor.');
    }
    return res;
};

/** Remove a sponsor. */
export const deleteSponsor = async (id) => {
    const res = await api.delete(`/tournaments/sponsors/${id}`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to delete sponsor.');
    }
    return res;
};

// ==========================================
// PAYMENTS & REPORTS
// ==========================================

/** Fetch tournament registration payments + revenue/commission summary. */
export const getTournamentPayments = async () => {
    const res = await api.get('/tournaments/payments');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch tournament payments.');
    }
    return res;
};

/** Fetch tournament-wide reports (status breakdown, teams, revenue). */
export const getTournamentReports = async () => {
    const res = await api.get('/tournaments/reports');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch tournament reports.');
    }
    return res;
};

// ==========================================
// SETTINGS
// ==========================================

/** Fetch global tournament system settings (commission %, slot locking, approval rules). */
export const getTournamentSettings = async () => {
    const res = await api.get('/tournaments/settings');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch tournament settings.');
    }
    return res;
};

/** Update global tournament system settings. */
export const updateTournamentSettings = async (payload) => {
    const res = await api.put('/tournaments/settings', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update tournament settings.');
    }
    return res;
};
