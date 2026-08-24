import api from './api';

/** List refund requests -- branch-scoped for Staff/Owner, all for Super Admin. */
export const getRefundRequests = async () => {
    const res = await api.get('/refunds');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch refund requests.');
    }
    return res;
};

/** Submit a new refund request (Staff/Owner). */
export const createRefundRequest = async (payload) => {
    const res = await api.post('/refunds', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to submit refund request.');
    }
    return res;
};

/** Approve/reject/settle a refund request (Owner/Super Admin). */
export const updateRefundStatus = async (id, status, adminNotes) => {
    const res = await api.patch(`/refunds/${id}/status`, { status, adminNotes });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update refund status.');
    }
    return res;
};
