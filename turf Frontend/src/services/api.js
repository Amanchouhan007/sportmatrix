import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5005';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Inject JWT Auth Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('sport_matrix_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Gracefully handle network disconnects or API errors without crashing UI
api.interceptors.response.use(
    (response) => response.data || response,
    (error) => {
        const message = error.response?.data?.message || error.message || '';
        const status = error.response?.status;
        
        if (status === 403 || status === 401) {
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('deactivated') || lowerMsg.includes('suspended') || lowerMsg.includes('revoked') || lowerMsg.includes('access denied')) {
                localStorage.removeItem('token');
                localStorage.removeItem('sport_matrix_token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?reason=deactivated';
                }
            }
        }

        const customError = {
            success: false,
            message: message || 'Server unreachable.',
            status: status || 500,
            isNetworkError: !error.response
        };
        console.warn('[API Client Warning]:', customError.message);
        return Promise.reject(customError);
    }
);

// Non-breaking Helper Wrappers for UI Components
export const getApi = async (url, params = {}) => {
    try {
        return await api.get(url, { params });
    } catch (err) {
        return { success: false, error: err };
    }
};

export const postApi = async (url, data = {}) => {
    try {
        return await api.post(url, data);
    } catch (err) {
        return { success: false, error: err };
    }
};

export const putApi = async (url, data = {}) => {
    try {
        return await api.put(url, data);
    } catch (err) {
        return { success: false, error: err };
    }
};

export const patchApi = async (url, data = {}) => {
    try {
        return await api.patch(url, data);
    } catch (err) {
        return { success: false, error: err };
    }
};

export const deleteApi = async (url, params = {}) => {
    try {
        return await api.delete(url, { params });
    } catch (err) {
        return { success: false, error: err };
    }
};

export default api;
