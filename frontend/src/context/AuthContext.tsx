import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getUserRoles, getHighestRole, isTokenExpired } from '../utils/authUtils';
import api from '../services/api';

interface AuthContextType {
    isLoggedIn: boolean;
    isInitializing: boolean;
    roles: string[];
    highestRole: string | null;
    hasRole: (role: string) => boolean;
    refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isInitializing: true,
    roles: [],
    highestRole: null,
    hasRole: () => false,
    refreshAuth: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const refreshAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired()) {
            if (token && isTokenExpired()) {
                localStorage.removeItem('token');
                localStorage.removeItem('userPhoto');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
            }
            setRoles([]);
            setIsLoggedIn(false);
            setIsInitializing(false);
            return;
        }

        // Hay token válido: marcamos sesión activa y refrescamos roles desde backend (/me)
        setIsLoggedIn(true);

        try {
            const meRes = await api.get('/me');
            const backendRoles = meRes.data?.roles;
            if (Array.isArray(backendRoles)) {
                setRoles(backendRoles);
            } else {
                setRoles(getUserRoles());
            }
        } catch {
            // Fallback al JWT si /me falla temporalmente
            setRoles(getUserRoles());
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        void refreshAuth();

        const handleStorage = () => { void refreshAuth(); };
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                void refreshAuth();
            }
        };
        const handleFocus = () => { void refreshAuth(); };

        window.addEventListener('storage', handleStorage);
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        const interval = window.setInterval(() => {
            void refreshAuth();
        }, 60000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleFocus);
            window.clearInterval(interval);
        };
    }, []);

    const hasRole = (role: string) => roles.includes(role);
    const highestRole = getHighestRole(roles);

    return (
        <AuthContext.Provider value={{ isLoggedIn, isInitializing, roles, highestRole, hasRole, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
