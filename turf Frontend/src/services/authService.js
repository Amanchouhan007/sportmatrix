import api from './api';

/**
 * Log in a user with email and password. Talks to the real backend only --
 * there is no offline/mock fallback. A failed login is a real failure.
 */
export const loginUser = async (email, password, _selectedRole) => {
    const resData = await api.post('/auth/login', { email, password });
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Invalid credentials.');
    }
    return resData;
};

/**
 * Register a new customer account.
 */
export const registerUser = async ({ name, email, password, phone }) => {
    const resData = await api.post('/auth/register', { name, email, password, phone });
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Registration failed.');
    }
    return resData;
};

/**
 * Fetch current user profile
 */
export const getProfile = async () => {
    const resData = await api.get('/auth/me');
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Failed to fetch profile.');
    }
    return resData.data;
};

/**
 * Update current user profile details
 */
export const updateProfile = async (profileData) => {
    const resData = await api.put('/auth/profile', profileData);
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Failed to update profile.');
    }
    if (resData.data) {
        const storedUser = localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : {};
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...resData.data }));
    }
    return resData;
};

/**
 * Change current user password
 */
export const changePassword = async (passwords) => {
    const resData = await api.post('/auth/change-password', passwords);
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Failed to change password.');
    }
    return resData;
};

/**
 * Fetch all users across the platform (Super Admin only)
 */
export const getAllUsers = async (params = {}) => {
    const resData = await api.get('/auth/users', { params });
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Failed to fetch users.');
    }
    return resData.data || [];
};

/**
 * Update user active/suspended status
 */
export const updateUserStatus = async (id, status) => {
    const resData = await api.patch(`/auth/users/${id}/status`, { status });
    if (!resData || resData.success === false) {
        throw new Error(resData?.message || 'Failed to update user status.');
    }
    return resData;
};
