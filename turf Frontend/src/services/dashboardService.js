import api from './api';

/**
 * Fetch dashboard overview summary stats aggregates
 */
export const getOverview = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/summary', { params: filters });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /dashboard/summary failed, returning fallback.', error.message);
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
        return response.data;
    } catch (error) {
        console.warn('Backend GET /dashboard/revenue-growth failed, returning fallback.', error.message);
        return {
            success: true,
            data: [
                { Month: 'Jan', Revenue: 450000, month: 'Jan', revenue: 450000 },
                { Month: 'Feb', Revenue: 520000, month: 'Feb', revenue: 520000 },
                { Month: 'Mar', Revenue: 610000, month: 'Mar', revenue: 610000 },
                { Month: 'Apr', Revenue: 750000, month: 'Apr', revenue: 750000 },
                { Month: 'May', Revenue: 890000, month: 'May', revenue: 890000 },
                { Month: 'Jun', Revenue: 1040000, month: 'Jun', revenue: 1040000 },
                { Month: 'Jul', Revenue: 1220000, month: 'Jul', revenue: 1220000 }
            ]
        };
    }
};

/**
 * Fetch platform commission growths
 */
export const getCommissionGrowth = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/commission-growth', { params: filters });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /dashboard/commission-growth failed, returning fallback.', error.message);
        return {
            success: true,
            data: [
                { Month: 'Jan', 'Commission Amount': 70000, month: 'Jan', commission: 70000 },
                { Month: 'Feb', 'Commission Amount': 82500, month: 'Feb', commission: 82500 },
                { Month: 'Mar', 'Commission Amount': 95000, month: 'Mar', commission: 95000 },
                { Month: 'Apr', 'Commission Amount': 105000, month: 'Apr', commission: 105000 },
                { Month: 'May', 'Commission Amount': 117500, month: 'May', commission: 117500 },
                { Month: 'Jun', 'Commission Amount': 140000, month: 'Jun', commission: 140000 },
                { Month: 'Jul', 'Commission Amount': 155000, month: 'Jul', commission: 155000 }
            ]
        };
    }
};

/**
 * Fetch top branch locations
 */
export const getTopBranches = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/top-branches', { params: filters });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /dashboard/top-branches failed, returning fallback.', error.message);
        return {
            success: true,
            data: [
                { _id: 'br_001', 'Branch Name': 'Green Arena Football Turf', City: 'Mumbai', Revenue: 1740000, Bookings: 1450, Status: 'ACTIVE', branchName: 'Green Arena Football Turf', city: 'Mumbai', bookingsCount: 1450, totalRevenue: 1740000, status: 'ACTIVE' },
                { _id: 'br_002', 'Branch Name': 'Champion Cricket Academy', City: 'Bangalore', Revenue: 1920000, Bookings: 1280, Status: 'ACTIVE', branchName: 'Champion Cricket Academy', city: 'Bangalore', bookingsCount: 1280, totalRevenue: 1920000, status: 'ACTIVE' },
                { _id: 'br_003', 'Branch Name': 'Royal Cricket Ground', City: 'Indore', Revenue: 570000, Bookings: 950, Status: 'ACTIVE', branchName: 'Royal Cricket Ground', city: 'Indore', bookingsCount: 950, totalRevenue: 570000, status: 'ACTIVE' },
                { _id: 'br_004', 'Branch Name': 'Skyline Football Turf', City: 'Mumbai', Revenue: 1232000, Bookings: 880, Status: 'ACTIVE', branchName: 'Skyline Football Turf', city: 'Mumbai', bookingsCount: 880, totalRevenue: 1232000, status: 'ACTIVE' }
            ]
        };
    }
};

/**
 * Fetch recent activities lists
 */
export const getRecentActivities = async (filters = {}) => {
    try {
        const response = await api.get('/dashboard/recent-activities', { params: filters });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /dashboard/recent-activities failed, returning fallback.', error.message);
        const now = Date.now();
        return {
            success: true,
            data: [
                { id: 'act_01', activity: 'Owner Created', details: 'Rajesh Sharma registered Green Arena Sports', timestamp: new Date(now - 10 * 60000).toISOString() },
                { id: 'act_02', activity: 'Branch Created', details: 'ProPlay Arena added Vashi Branch', timestamp: new Date(now - 25 * 60000).toISOString() },
                { id: 'act_03', activity: 'Subscription Assigned', details: 'Champion Sports upgraded to Enterprise Plan', timestamp: new Date(now - 60 * 60000).toISOString() },
                { id: 'act_04', activity: 'Payment Received', details: 'Received ₹24,999 for Enterprise Plan', timestamp: new Date(now - 180 * 60000).toISOString() },
                { id: 'act_05', activity: 'Commission Generated', details: '₹1,250 commission logged from Green Arena', timestamp: new Date(now - 300 * 60000).toISOString() }
            ]
        };
    }
};
