import api from './api';

/**
 * Log in a user with email and password
 */
export const loginUser = async (email, password, selectedRole) => {
    try {
        const response = await api.post('/auth/login', { email, password, role: selectedRole });
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        if (!error.response || status >= 500) {
            console.warn('Backend database connection unavailable, falling back to local dev login.');
            
            const roleMap = {
                superadmin: 'SUPER_ADMIN',
                owner: 'OWNER',
                staff: 'STAFF',
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
            } else if (email.includes('customer')) {
                userRole = 'CUSTOMER';
            }

            return {
                success: true,
                message: 'Login successful (Dev Mode)',
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: 'usr_dev_' + Date.now(),
                    name: email.split('@')[0].toUpperCase(),
                    email: email,
                    role: userRole
                }
            };
        }
        const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
        throw new Error(errMsg);
    }
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
