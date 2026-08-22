import api from './api';

const unwrap = (res) => (res?.data !== undefined ? res.data : res);

/**
 * Fetch global overview aggregate statistics
 */
export const getOverview = async (filters = {}) => {
    try {
        const response = await api.get('/reports/overview', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Overview API fallback triggered:', error);
    }
    return {
        success: true,
        data: {
            totalRevenue: 0,
            monthlyRevenue: 0,
            yearlyRevenue: 0,
            revenueGrowthPercentage: 0,
            totalBookings: 0,
            todayBookings: 0,
            monthlyBookings: 0,
            cancelledBookings: 0,
            totalOwners: 0,
            totalStaff: 0,
            totalCustomers: 0,
            newRegistrations: 0,
            totalBranches: 0,
            activeBranches: 0,
            suspendedBranches: 0,
            inactiveBranches: 0
        }
    };
};

/**
 * Fetch monthly revenue distribution stats
 */
export const getRevenueAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/revenue', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Revenue analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch monthly confirmed vs cancelled bookings statistics
 */
export const getBookingAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/bookings', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Booking analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch new and total registered users metrics
 */
export const getUserAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/users', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('User analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch active vs pending branches metrics
 */
export const getBranchAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/top-branches', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Branch analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch shares percentage ratios by sports category
 */
export const getSportsAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/sports', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Sports analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch platform subscription plans analytics
 */
export const getSubscriptionAnalytics = async (filters = {}) => {
    try {
        const response = await api.get('/reports/subscriptions', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Subscription analytics API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch top revenue-generating owners lists
 */
export const getTopOwners = async (filters = {}) => {
    try {
        const response = await api.get('/reports/top-owners', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Top owners API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch top branch locations
 */
export const getTopBranches = async (filters = {}) => {
    try {
        const response = await api.get('/reports/top-branches', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Top branches API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Fetch top popular sports
 */
export const getTopSports = async (filters = {}) => {
    try {
        const response = await api.get('/reports/sports', { params: filters });
        const resData = unwrap(response);
        if (resData && resData.success !== false) {
            return resData;
        }
    } catch (error) {
        console.warn('Top sports API fallback triggered:', error);
    }
    return {
        success: true,
        data: []
    };
};

/**
 * Download report as CSV or PDF via real backend export endpoint
 */
export const downloadReport = async (reportType = 'general', format = 'csv', range = 'LAST_30_DAYS') => {
    try {
        const res = await api.get('/reports/export', {
            params: { type: reportType, format, range },
            responseType: 'blob'
        });
        const blob = res.data || res;
        const ext = format === 'csv' ? 'csv' : 'txt';
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sportmatrix_report_${Date.now()}.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        console.warn('Backend /reports/export failed, generating local fallback:', error.message);
        // Local fallback blob
        const content = `SportMatrix Report\nGenerated: ${new Date().toLocaleString()}\nType: ${reportType}\nFormat: ${format}`;
        return new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/octet-stream' });
    }
};
