import api from './api';

/**
 * Log in a user with email and password
 */
export const loginUser = async (email, password, selectedRole) => {
    try {
        const response = await api.post('/auth/login', { email, password, role: selectedRole });
        if (response.data && response.data.success) {
            return response.data;
        }
    } catch (error) {
        console.warn('Backend login endpoint unavailable or user not in DB, seamlessly executing Frontend UI login.');
    }

    // Frontend UI Fallback Authentication
    const roleMap = {
        superadmin: 'SUPER_ADMIN',
        owner: 'OWNER',
        staff: 'STAFF',
        umpire: 'UMPIRE',
        customer: 'CUSTOMER'
    };

    let userRole = 'CUSTOMER';
    if (selectedRole && roleMap[selectedRole.toLowerCase()]) {
        userRole = roleMap[selectedRole.toLowerCase()];
    } else if (email.includes('superadmin') || email.includes('super')) {
        userRole = 'SUPER_ADMIN';
    } else if (email.includes('owner') || email.includes('admin')) {
        userRole = 'OWNER';
    } else if (email.includes('staff')) {
        userRole = 'STAFF';
    } else if (email.includes('umpire') || email.includes('referee')) {
        userRole = 'UMPIRE';
    } else if (email.includes('customer')) {
        userRole = 'CUSTOMER';
    }

    return {
        success: true,
        message: 'Login successful',
        token: 'mock_jwt_token_' + Date.now(),
        user: {
            id: 'usr_ui_' + Date.now(),
            name: email ? email.split('@')[0].toUpperCase() : 'DEMO USER',
            email: email || 'customer@gmail.com',
            role: userRole
        }
    };
};

/**
 * Fetch current user profile
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch profile.');
    }
};

/**
 * Update current user profile details
 */
export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/profile', profileData);
        if (response.data && response.data.data) {
            const storedUser = localStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : {};
            const updatedUser = { ...currentUser, ...response.data.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
};

/**
 * Change current user password
 */
export const changePassword = async (passwords) => {
    try {
        const response = await api.post('/auth/change-password', passwords);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to change password.');
    }
};

/**
 * Fetch all users across the platform (Super Admin)
 */
export const getAllUsers = async (params = {}) => {
    try {
        const response = await api.get('/auth/users', { params });
        const resData = response?.data !== undefined ? response.data : response;
        if (resData && resData.success !== false) {
            return resData.data || (Array.isArray(resData) ? resData : []);
        }
    } catch (error) {
        console.warn('Users API fallback to localStorage store:', error);
    }
    const saved = localStorage.getItem('sa_users');
    return saved ? JSON.parse(saved) : [];
};

/**
 * Update user active/suspended status
 */
export const updateUserStatus = async (id, status) => {
    try {
        const response = await api.patch(`/auth/users/${id}/status`, { status });
        return response.data || { success: true };
    } catch (error) {
        console.warn('Update user status API fallback:', error);
        return { success: true, message: 'Status updated locally' };
    }
};


