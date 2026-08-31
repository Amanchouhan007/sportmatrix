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

    // Require active session token and user object
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check role access if allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0) {
        const currentRoleUpper = (user.role || '').toUpperCase().replace(/[-_]/g, '');
        const isAllowed = allowedRoles.some(r => r.toUpperCase().replace(/[-_]/g, '') === currentRoleUpper || currentRoleUpper === 'SUPERADMIN' || currentRoleUpper === 'ADMIN');
        if (!isAllowed) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
