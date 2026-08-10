import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 2500,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor to inject Authorization Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
