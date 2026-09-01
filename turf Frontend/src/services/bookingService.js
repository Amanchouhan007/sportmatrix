import api from './api';

/** Upcoming (future, not-yet-completed) bookings -- scoped to the logged-in user's role. */
export const getUpcomingBookings = async () => {
    const res = await api.get('/bookings/upcoming');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch upcoming bookings.');
    }
    return res;
};

/** Full booking history -- scoped to the logged-in user's role. */
export const getBookingHistory = async () => {
    const res = await api.get('/bookings/history');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch booking history.');
    }
    return res;
};

/** Booking ledger summary (today/week/month counts + total revenue) -- OWNER/STAFF/SUPER_ADMIN. */
export const getBookingSummary = async () => {
    const res = await api.get('/bookings/summary');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch booking summary.');
    }
    return res;
};

/** Update a booking's lifecycle status (PENDING/COMPLETED/HELD/FAILED/REFUND_PENDING/REFUNDED) -- OWNER/STAFF/SUPER_ADMIN. */
export const updateBookingStatus = async (id, status) => {
    const res = await api.put(`/bookings/${id}/status`, { status });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update booking status.');
    }
    return res;
};

/** Create a real slot booking (staff walk-in or customer direct booking). */
export const createBooking = async (payload) => {
    const res = await api.post('/bookings', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create booking.');
    }
    return res;
};

/** Cancel a booking -- refunds to the customer's wallet if they have an account. */
export const cancelBooking = async (id) => {
    const res = await api.post(`/bookings/${id}/cancel`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to cancel booking.');
    }
    return res;
};

/** Update a booking's ground staff check-in status (CHECKED_IN / NO_SHOW / PENDING_CHECK_IN). */
export const updateCheckInStatus = async (id, checkInStatus) => {
    const res = await api.put(`/bookings/${id}/check-in`, { checkInStatus });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update check-in status.');
    }
    return res;
};
