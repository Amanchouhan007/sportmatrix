import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, user, loading } = useAuth();

    // Show a loading screen during context initialization
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400 text-sm font-medium">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    // Auto-initialize demo session if accessing protected path directly without token/user
    if (!token || !user) {
        const defaultRole = allowedRoles && allowedRoles.length > 0 ? allowedRoles[0] : 'OWNER';
        const demoUser = {
            id: 'usr_demo',
            name: 'Turf Admin',
            email: 'owner@gmail.com',
            role: defaultRole,
            mobile: '+91 98765 43210'
        };
        try {
            localStorage.setItem('token', 'demo_jwt_token_2026');
            localStorage.setItem('user', JSON.stringify(demoUser));
        } catch (e) {}
    }

    return children;
}
