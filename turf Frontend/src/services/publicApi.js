import axios from 'axios';

/**
 * publicApi — unauthenticated Axios client for public marketplace reads.
 *
 * This client has NO request interceptor and will NEVER attach a JWT token.
 * Use this for all public website pages: /, /turfs, /turfs/:id, etc.
 *
 * Rule: publicApi is for READ-ONLY public endpoints (/api/v1/public/*).
 *       For Owner/Admin/Staff private operations, use the authenticated api.js client.
 */
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor: unwrap .data and surface errors cleanly (mirrors api.js)
publicApi.interceptors.response.use(
    (response) => response.data || response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Server unreachable.';
        return Promise.reject({ success: false, message, status: error.response?.status || 500 });
    }
);

export default publicApi;
