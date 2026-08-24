import api from './api';

/** List maintenance tickets, branch-scoped automatically for Owner/Staff; Super Admin sees all. */
export const getMaintenanceTickets = async () => {
    const res = await api.get('/maintenance/tickets');
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch maintenance tickets.');
    }
    return res;
};

/** Create a new maintenance ticket. */
export const createMaintenanceTicket = async (payload) => {
    const res = await api.post('/maintenance/tickets', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create maintenance ticket.');
    }
    return res;
};

/** Update a ticket's status and/or any other field (reassign specialist, priority, deadline, notes). */
export const updateMaintenanceTicket = async (id, payload) => {
    const res = await api.put(`/maintenance/tickets/${id}`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update maintenance ticket.');
    }
    return res;
};

/** Delete a maintenance ticket. */
export const deleteMaintenanceTicket = async (id) => {
    const res = await api.delete(`/maintenance/tickets/${id}`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to delete maintenance ticket.');
    }
    return res;
};
