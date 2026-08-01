import api from './api';

/**
 * Fetch general statistics summary of transactions
 */
export const getPaymentStats = async () => {
    try {
        const response = await api.get('/billing/history?limit=1');
        const logs = response.data?.data || [];
        const totalVolume = logs.reduce((sum, l) => {
            const raw = typeof l.amount === 'string' ? Number(l.amount.replace(/[^0-9]/g, '')) : Number(l.amount);
            return sum + raw;
        }, 0);

        return {
            success: true,
            data: {
                totalTransactions: logs.length,
                totalVolume,
                successfulPayments: logs.length,
                failedPayments: 0,
                pendingRefunds: 0
            }
        };
    } catch (error) {
        throw new Error('Failed to fetch payment statistics.');
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
        throw new Error('Failed to fetch payment transaction logs.');
    }
};

/**
 * Get single payment transaction detail by ID
 */
export const getPaymentLogById = async (id) => {
    try {
        const response = await api.get('/billing/history');
        const logs = response.data?.data || [];
        const log = logs.find(p => p.id === id || p._id === id || p.paymentId === id) || logs[0];
        return { success: true, data: log };
    } catch (error) {
        throw new Error('Failed to fetch transaction details.');
    }
};
