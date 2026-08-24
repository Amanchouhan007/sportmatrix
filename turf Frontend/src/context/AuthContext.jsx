import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService';
import { getSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                getSocket();
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                // Clear corrupt data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    /**
     * Authenticate user with the backend. The account's role always comes from
     * the server -- it is never guessed or overridden on the client.
     * @param {string} email
     * @param {string} password
     */
    const login = async (email, password) => {
        const data = await loginUser(email, password);

        if (!data || !data.success) {
            throw new Error(data?.message || 'Login failed');
        }

        const userObj = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
        setToken(data.token);
        getSocket();
        return userObj;
    };

    /**
     * Log out current user, clear storage and state, and redirect to main website homepage
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        disconnectSocket();
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    /**
     * Get the active user object
     */
    const getCurrentUser = () => user;

    /**
     * Update user details in context and cache
     */
    const updateUser = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    /**
     * Set active user session directly from a real backend response (e.g. after
     * an owner-onboarding flow that returns its own token). Never fabricates a
     * token or elevates a role -- both must come from the server.
     */
    const setSession = (userObj, tokenStr) => {
        if (!tokenStr) {
            throw new Error('setSession requires a real token from the backend.');
        }
        const sessionUser = { ...userObj, role: userObj.role || 'CUSTOMER' };
        localStorage.setItem('token', tokenStr);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setToken(tokenStr);
        return sessionUser;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, setSession, logout, getCurrentUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
