import api from './api';

/** Fetch the active payment gateway config (Super Admin). Secret keys come back masked. */
export const getPaymentGatewaySettings = async () => {
    const res = await api.get('/settings/payment-gateway');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch payment gateway settings.');
    }
    return res;
};

/** Switch the active provider and/or update gateway keys (Super Admin). */
export const updatePaymentGatewaySettings = async (payload) => {
    const res = await api.put('/settings/payment-gateway', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update payment gateway settings.');
    }
    return res;
};
