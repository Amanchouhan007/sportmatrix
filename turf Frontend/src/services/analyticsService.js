import api from './api';

/**
 * Fetch global overview aggregate statistics
 */
export const getOverview = async () => {
    try {
        const response = await api.get('/reports/overview');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch overview analytics.');
    }
};

/**
 * Fetch monthly revenue distribution stats
 */
export const getRevenueAnalytics = async () => {
    try {
        const response = await api.get('/reports/revenue');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch revenue analytics.');
    }
};

/**
 * Fetch monthly confirmed vs cancelled bookings statistics
 */
export const getBookingAnalytics = async () => {
    try {
        const response = await api.get('/reports/bookings');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch booking analytics.');
    }
};

/**
 * Fetch new and total registered users metrics
 */
export const getUserAnalytics = async () => {
    return {
        success: true,
        data: [
            { month: 'Jan', newUsers: 450, totalUsers: 5400 },
            { month: 'Feb', newUsers: 580, totalUsers: 5980 },
            { month: 'Mar', newUsers: 640, totalUsers: 6620 },
            { month: 'Apr', newUsers: 720, totalUsers: 7340 },
            { month: 'May', newUsers: 810, totalUsers: 8150 },
            { month: 'Jun', newUsers: 950, totalUsers: 9100 },
            { month: 'Jul', newUsers: 1040, totalUsers: 10140 }
        ]
    };
};

/**
 * Fetch active vs pending branches metrics
 */
export const getBranchAnalytics = async () => {
    return {
        success: true,
        data: [
            { month: 'Jan', active: 90, pending: 5 },
            { month: 'Feb', active: 98, pending: 7 },
            { month: 'Mar', active: 104, pending: 4 },
            { month: 'Apr', active: 110, pending: 6 },
            { month: 'May', active: 114, pending: 3 },
            { month: 'Jun', active: 118, pending: 5 }
        ]
    };
};

/**
 * Fetch shares percentage ratios by sports category
 */
export const getSportsAnalytics = async () => {
    try {
        const response = await api.get('/reports/sports');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch sports analytics.');
    }
};

/**
 * Fetch platform subscription plans analytics
 */
export const getSubscriptionAnalytics = async () => {
    return {
        success: true,
        data: [
            { planName: 'Starter', count: 18, revenue: 17982 },
            { planName: 'Professional', count: 24, revenue: 59976 },
            { planName: 'Enterprise', count: 6, revenue: 29994 }
        ]
    };
};

/**
 * Fetch top revenue-generating owners lists
 */
export const getTopOwners = async () => {
    return {
        success: true,
        data: [
            { id: 'own_001', ownerName: 'Rajesh Sharma', businessName: 'Green Arena Sports', revenue: 485000, branches: 3 },
            { id: 'own_003', ownerName: 'Suresh Patil', businessName: 'Royal Cricket Ground', revenue: 750000, branches: 4 },
            { id: 'own_002', ownerName: 'Vikramaditya Roy', businessName: 'Champion Sports Hub', revenue: 320000, branches: 2 }
        ]
    };
};

/**
 * Fetch top branch locations
 */
export const getTopBranches = async () => {
    return {
        success: true,
        data: [
            { id: 'br_001', branchName: 'Green Arena Football Turf', city: 'Mumbai', bookings: 1450, revenue: 1740000 },
            { id: 'br_002', branchName: 'Champion Cricket Academy', city: 'Bangalore', bookings: 1280, revenue: 1920000 },
            { id: 'br_003', branchName: 'Royal Cricket Ground', city: 'Indore', bookings: 950, revenue: 570000 }
        ]
    };
};

/**
 * Fetch top popular sports
 */
export const getTopSports = async () => {
    try {
        const response = await api.get('/reports/sports');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch top sports.');
    }
};

/**
 * Dummy handler for file exports (PDF/CSV)
 */
export const downloadReport = async (reportType = 'general', format = 'pdf') => {
    const content = `Report: ${reportType.toUpperCase()}\nGenerated at: ${new Date().toLocaleString()}\nFormat: ${format}`;
    return new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
};
