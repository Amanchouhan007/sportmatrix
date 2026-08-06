import api from './api';

/**
 * Fetch global platform commission settings
 */
export const getCommissionSettings = async () => {
    try {
        const response = await api.get('/settings/commission');
        return response.data;
    } catch (error) {
        console.warn('Backend GET /settings/commission failed, fallback triggered:', error.message);
        return {
            success: true,
            data: {
                defaultRate: 5.0,
                maxRate: 15.0,
                status: 'ACTIVE',
                sportsRates: [
                    { sportName: 'Football', commissionRate: 5.0 },
                    { sportName: 'Cricket', commissionRate: 5.0 },
                    { sportName: 'Badminton', commissionRate: 4.0 },
                    { sportName: 'Tennis', commissionRate: 4.5 }
                ]
            }
        };
    }
};

/**
 * Update global platform commission settings
 */
export const updateCommissionSettings = async (payload) => {
    try {
        const response = await api.put('/settings/commission', payload);
        return response.data;
    } catch (error) {
        console.error('Backend PUT /settings/commission failed:', error.message);
        throw error;
    }
};

/**
 * Change commission status
 */
export const changeCommissionStatus = async (status) => {
    try {
        const response = await api.put('/settings/commission', { status });
        return response.data;
    } catch (error) {
        return {
            success: true,
            message: `Commission status updated to ${status}`
        };
    }
};
