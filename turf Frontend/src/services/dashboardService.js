import api from './api';

/**
 * Fetch dashboard overview summary stats aggregates
 */
export const getOverview = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/summary', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/summary failed or empty:', error.message);
        return {
            success: true,
            data: {
                totalBranches: 0,
                totalRevenue: 0,
                totalUsers: 0,
                activeSubscriptions: 0,
                monthlyGrowth: 0
            }
        };
    }
};

/**
 * Fetch monthly revenue stats progress
 */
export const getRevenueGrowth = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/revenue-growth', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/revenue-growth failed:', error.message);
        return {
            success: true,
            data: []
        };
    }
};

/**
 * Fetch platform commission growths
 */
export const getCommissionGrowth = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/commission-growth', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/commission-growth failed:', error.message);
        return {
            success: true,
            data: []
        };
    }
};

/**
 * Fetch top branch locations
 */
export const getTopBranches = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/top-branches', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/top-branches failed:', error.message);
        return {
            success: true,
            data: []
        };
    }
};

/**
 * Fetch recent activities lists
 */
export const getRecentActivities = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/recent-activities', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/recent-activities failed:', error.message);
        return {
            success: true,
            data: []
        };
    }
};

/**
 * Fetch 100% database-authoritative operational history analytics
 */
export const getDashboardHistory = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/history', { params: filters });
        return response;
    } catch (error) {
        console.warn('Backend GET /dashboard/history failed:', error.message);
        return {
            success: false,
            data: { dailyHistory: [], weeklyBreakdown: [], allLogs: [] }
        };
    }
};
