import api from './api';

/**
 * Fetch general statistics summary of transactions
 */
export const getPaymentStats = async (params = {}) => {
    try {
        const response = await api.get('/billing/stats', { params });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /billing/stats failed, fallback triggered:', error.message);
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
    }
};

/**
 * List payment transactions with filters and pagination
 */
export const getPaymentLogs = async (params = {}) => {
    try {
        const response = await api.get('/billing/history', { params });
        return response.data;
    } catch (error) {
        console.warn('Backend GET /billing/history failed, fallback triggered:', error.message);
        return {
            success: true,
            data: [],
            pagination: {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 1
            }
        };
    }
};

/**
 * Get single payment transaction detail by ID
 */
export const getPaymentLogById = async (id) => {
    try {
        const response = await api.get(`/billing/history/${id}`);
        return response.data;
    } catch (error) {
        console.warn('Backend GET /billing/history/:id failed, fallback triggered:', error.message);
        return {
            success: false,
            message: 'Transaction record not found'
        };
    }
};
