import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { estaAutenticado, esAdmin, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !esAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const { estaAutenticado, esAdmin } = useAuth();

    if (estaAutenticado) {
        if (esAdmin()) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};
