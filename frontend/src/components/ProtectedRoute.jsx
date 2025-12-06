import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Ruta protegida que requiere autenticación JWT
 * Los permisos específicos se manejan con CASL dentro de los componentes
 */
export const ProtectedRoute = ({ children }) => {
    const { estaAutenticado, cargando } = useAuth();

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

    return children;
};

/**
 * Ruta pública que redirige si el usuario ya está autenticado
 */
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
