import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    /** Roles que tienen permiso para acceder. Ej: ['ROLE_ADMIN', 'ROLE_TRABAJADOR'] */
    allowedRoles: string[];
    /** Ruta a la que redirigir si no tiene permiso (por defecto '/') */
    redirectTo?: string;
}

/**
 * Componente de ruta protegida.
 * - Si el usuario NO está autenticado → redirige a /login
 * - Si está autenticado pero NO tiene el rol necesario → redirige a redirectTo (por defecto '/')
 * - Si tiene permiso → renderiza el Outlet (la ruta hija)
 */
export default function ProtectedRoute({ allowedRoles, redirectTo = '/' }: ProtectedRouteProps) {
    const { isLoggedIn, hasRole, isInitializing } = useAuth();

    if (isInitializing) {
        return null; // or a loading spinner
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    const isAllowed = allowedRoles.some((role) => hasRole(role));
    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
