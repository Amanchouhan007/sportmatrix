import api from './api';

const REAL_PAYMENT_LOGS_FALLBACK = [];

/**
 * Fetch general statistics summary of transactions
 */
export const getPaymentStats = async (params = {}) => {
    try {
        const res = await api.get('/billing/stats', { params });
        const resData = res?.data?.summary ? res.data : (res?.data || res);
        if (resData && resData.success && resData.data) {
            return resData;
        }
        if (resData && resData.summary) {
            return { success: true, data: resData };
        }
    } catch (error) {
        console.warn('Backend GET /billing/stats note:', error.message);
    }

    return {
        success: true,
        data: {
            summary: {
                totalTransactions: 0,
                totalRevenue: 0,
                totalCommission: 0,
                pendingPayments: 0,
                pendingCount: 0,
                completedCount: 0,
                refundedAmount: 0,
                refundedCount: 0
            }
        }
    };
};

/**
 * List payment transactions with filters and pagination
 */
export const getPaymentLogs = async (params = {}) => {
    try {
        const res = await api.get('/billing/history', { params });
        const resData = res?.data !== undefined ? res.data : res;
        const rawLogs = (resData && Array.isArray(resData.data)) ? resData.data : (Array.isArray(resData) ? resData : (Array.isArray(res?.data) ? res.data : []));
        const pagination = resData?.pagination || res?.pagination || { total: rawLogs.length, page: 1, limit: 20, totalPages: 1 };

        if (resData && resData.success !== false) {
            return {
                success: true,
                data: rawLogs,
                pagination
            };
        }
    } catch (error) {
        console.warn('Backend GET /billing/history note:', error.message);
    }

    return {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 1 }
    };
};

/**
 * Get single payment transaction detail by ID
 */
export const getPaymentLogById = async (id) => {
    try {
        const res = await api.get(`/billing/history/${id}`);
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && (resData.success || resData.id || resData._id)) {
            return resData.data ? resData : { success: true, data: resData };
        }
    } catch (error) {
        console.warn(`Backend GET /billing/history/${id} failed:`, error.message);
    }

    return { success: false, data: null, message: 'Payment record not found.' };
};

/**
 * Fetch Team Match Payment Engine Overview for SuperAdmin
 */
export const getMatchPaymentsAdminOverview = async () => {
    try {
        const response = await api.get('/match-payments/admin/overview', { timeout: 1500 });
        if (response.data && response.data.success) {
            return response.data;
        }
        return { success: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Resolve match dispute
 */
export const resolveMatchDispute = async (payload) => {
    try {
        const response = await api.post('/match-payments/admin/resolve-dispute', payload);
        return response.data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Process POS Payment in Backend MySQL
 */
export const processPayment = async (payload) => {
    try {
        const response = await api.post('/billing/pay', payload);
        return response.data || response;
    } catch (error) {
        console.warn('Backend POST /billing/pay note:', error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Create Manual Payment Log in Backend MySQL
 */
export const createPaymentLog = async (payload) => {
    try {
        const response = await api.post('/billing/create-log', payload);
        return response.data || response;
    } catch (error) {
        console.warn('Backend POST /billing/create-log note:', error.message);
        return { success: false, message: error.message };
    }
};
