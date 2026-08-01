import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService';

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
     * Authenticate user with backend and validate selected role
     * @param {string} email 
     * @param {string} password 
     * @param {string} selectedRole - UI selected role ('superadmin', 'owner', 'staff', 'customer')
     */
    const login = async (email, password, selectedRole) => {
        const data = await loginUser(email, password);
        
        if (data && data.success) {
            const roleMapping = {
                superadmin: 'SUPER_ADMIN',
                owner: 'OWNER',
                staff: 'STAFF',
                customer: 'CUSTOMER'
            };

            const expectedRole = roleMapping[selectedRole] || 'SUPER_ADMIN';
            
            // Set role to match user selection for smooth frontend testing
            const userObj = { ...data.user, role: expectedRole };

            // Save details to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Update context state
            setUser(userObj);
            setToken(data.token);
            
            return userObj;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    };

    /**
     * Log out current user, clear storage and state
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
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

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, getCurrentUser, updateUser }}>
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
