import api from './api';

/** Role-scoped queue: Owner sees payments awaiting their receipt confirmation, Super Admin sees payments awaiting commission confirmation. */
export const getPendingSettlements = async () => {
    const res = await api.get('/match-payments/pending-settlements');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch pending settlements.');
    }
    return res;
};

/** Venue owner confirms they received the customer's payment for a MatchPayment row. */
export const confirmOwnerReceipt = async (paymentId) => {
    const res = await api.post(`/match-payments/payments/${paymentId}/confirm-owner-receipt`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to confirm owner receipt.');
    }
    return res;
};

/** Super Admin confirms the platform's commission leg for a MatchPayment row. */
export const confirmCommission = async (paymentId) => {
    const res = await api.post(`/match-payments/payments/${paymentId}/confirm-commission`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to confirm commission.');
    }
    return res;
};

/** Customer-scoped match history (captain of either side). */
export const getMyMatches = async () => {
    const res = await api.get('/match-payments/my-matches');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch your matches.');
    }
    return res;
};

/** Submit/agree to a match score for the handshake verification flow. */
export const submitMatchScore = async (matchId, teamAScore, teamBScore) => {
    const res = await api.post(`/match-payments/${matchId}/submit-score`, { teamAScore, teamBScore });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to submit match score.');
    }
    return res;
};

/** Raise a dispute on your own match. */
export const raiseMatchDispute = async (matchId, reason) => {
    const res = await api.post(`/match-payments/${matchId}/dispute`, { reason });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to raise dispute.');
    }
    return res;
};

/** Super Admin: full match-payment overview (matches + payments + audit logs). */
export const getAdminMatchPayments = async () => {
    const res = await api.get('/match-payments/admin/overview');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch match payments.');
    }
    return res;
};
