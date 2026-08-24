import api from './api';

/** List staff, branch-scoped automatically for Owner/Staff; Super Admin sees all (or pass branchId). */
export const getStaff = async (branchId) => {
    const res = await api.get('/staff', { params: branchId ? { branchId } : {} });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch staff.');
    }
    return res;
};

/** Creates a real, login-capable staff account (User + StaffMember). Returns a temporaryPassword to hand to the new hire. */
export const createStaff = async (payload) => {
    const res = await api.post('/staff', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to create staff member.');
    }
    return res;
};

/** Edit roster details and/or toggle Active/Inactive (which also suspends/reactivates their login). */
export const updateStaff = async (id, payload) => {
    const res = await api.put(`/staff/${id}`, payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update staff member.');
    }
    return res;
};

/** Removes the roster entry and suspends the linked login. */
export const deleteStaff = async (id) => {
    const res = await api.delete(`/staff/${id}`);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to remove staff member.');
    }
    return res;
};
