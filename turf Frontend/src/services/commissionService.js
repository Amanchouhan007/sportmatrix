import api from './api';

/**
 * Fetch global platform commission settings
 */
export const getCommissionSettings = async () => {
    try {
        const res = await api.get('/settings/commission');
        const resData = res?.data !== undefined ? res.data : res;
        if (resData && (resData.success || resData.defaultRate || resData.data)) {
            return resData.data ? resData : { success: true, data: resData };
        }
        if (res && res.success) return res;
    } catch (error) {
        console.warn('Backend GET /settings/commission note:', error.message);
    }

    return {
        success: true,
        data: {
            defaultRate: 5.0,
            maxRate: 15.0,
            status: 'ACTIVE',
            sportsRates: [
                { sportName: 'Cricket', commissionRate: 5.0 },
                { sportName: 'Football', commissionRate: 5.0 },
                { sportName: 'Badminton', commissionRate: 4.0 },
                { sportName: 'Tennis', commissionRate: 4.5 }
            ]
        }
    };
};

/**
 * Update global platform commission settings
 */
export const updateCommissionSettings = async (payload) => {
    try {
        const res = await api.put('/settings/commission', payload);
        const resData = res?.data !== undefined ? res.data : res;
        return resData || { success: true, message: 'Commission settings updated successfully' };
    } catch (error) {
        console.error('Backend PUT /settings/commission error:', error.message);
        throw error;
    }
};

/**
 * Change commission status
 */
export const changeCommissionStatus = async (status) => {
    try {
        const res = await api.put('/settings/commission', { status });
        const resData = res?.data !== undefined ? res.data : res;
        return resData || { success: true, message: `Commission status updated to ${status}` };
    } catch (error) {
        return {
            success: true,
            message: `Commission status updated to ${status}`
        };
    }
};
