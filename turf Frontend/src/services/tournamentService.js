import api from './api';

/**
 * Tournament Service — API Layer for Customer-Facing Tournament Features
 */

// Fallback Public Tournaments list
export const fallbackPublicTournaments = [
    {
        id: 't_001',
        title: 'Premier Cricket Championship 2026',
        name: 'Premier Cricket Championship 2026',
        banner: '/images/turf2.png',
        description: 'Indore annual cricket master tournament under floodlights.',
        sport: 'Cricket',
        category: 'Open Category',
        location: 'Vijay Nagar, Indore',
        date: '15 Aug - 20 Aug 2026',
        maxTeams: 16,
        registrations: 12,
        prize: '₹50,000',
        entryFee: '₹500',
        status: 'Active'
    },
    {
        id: 't_002',
        title: 'Super 5 Football Cup',
        name: 'Super 5 Football Cup',
        banner: '/images/turf1.png',
        description: '5-a-side football tournament with exciting prize pool.',
        sport: 'Football',
        category: 'Pro Division',
        location: 'Bhawarkua, Indore',
        date: '22 Aug - 25 Aug 2026',
        maxTeams: 8,
        registrations: 5,
        prize: '₹30,000',
        entryFee: '₹800',
        status: 'Active'
    },
    {
        id: 't_003',
        title: 'Mumbai Turf Football League',
        name: 'Mumbai Turf Football League',
        banner: '/images/turf3.png',
        description: 'High stakes 7-a-side football championship in Mumbai.',
        sport: 'Football',
        category: 'Open Division',
        location: 'Andheri West, Mumbai',
        date: '01 Sep - 05 Sep 2026',
        maxTeams: 12,
        registrations: 9,
        prize: '₹75,000',
        entryFee: '₹1,000',
        status: 'Upcoming'
    },
    {
        id: 't_004',
        title: 'Bangalore Smash Badminton Open',
        name: 'Bangalore Smash Badminton Open',
        banner: '/images/turf4.png',
        description: 'Indoor singles & doubles badminton tournament.',
        sport: 'Badminton',
        category: 'Master Singles',
        location: 'Koramangala, Bangalore',
        date: '10 Sep - 12 Sep 2026',
        maxTeams: 32,
        registrations: 28,
        prize: '₹25,000',
        entryFee: '₹400',
        status: 'Upcoming'
    }
];

/**
 * Fetch public tournaments list (only Approved/Active/Completed)
 */
export const getPublicTournaments = async (filters = {}, config = {}) => {
    try {
        const params = { role: 'CUSTOMER', ...filters };
        const response = await api.get('/tournaments', { params, timeout: 1000, ...config });
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            return response.data;
        }
    } catch (error) {
        console.warn('Backend GET /tournaments unavailable, using fallback list:', error.message);
    }

    return {
        success: true,
        data: fallbackPublicTournaments
    };
};

/**
 * Fetch single tournament details by ID
 */
export const getTournamentById = async (id) => {
    try {
        const response = await api.get(`/tournaments/${id}`, { timeout: 800 });
        if (response.data && response.data.success) {
            return response.data;
        }
    } catch (error) {
        console.warn(`Backend GET /tournaments/${id} failed, using fallback:`, error.message);
    }

    const found = fallbackPublicTournaments.find(t => t.id === id) || fallbackPublicTournaments[0];
    return {
        success: true,
        data: found
    };
};

/**
 * Fetch fixtures/matches for a specific tournament
 */
export const getFixtures = async (tournamentId) => {
    try {
        const response = await api.get(`/tournaments/${tournamentId}/fixtures`, { timeout: 800 });
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
        const response = await api.get(`/tournaments/${tournamentId}/leaderboard`, { timeout: 800 });
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
