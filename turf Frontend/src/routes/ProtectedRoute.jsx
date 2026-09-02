import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/ui/PageLoader';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, user, loading } = useAuth();

    // Show a loading screen during context initialization
    if (loading) {
        return <PageLoader text="Verifying Access..." fullScreen />;
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
