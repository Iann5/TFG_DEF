import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getUserRoles, getHighestRole, isTokenExpired } from '../utils/authUtils';

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

    const refreshAuth = () => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired()) {
            const userRoles = getUserRoles();
            setRoles(userRoles);
            setIsLoggedIn(true);
        } else {
            if (token && isTokenExpired()) {
                localStorage.removeItem('token');
                localStorage.removeItem('userPhoto');
            }
            setRoles([]);
            setIsLoggedIn(false);
        }
        setIsInitializing(false);
    };

    useEffect(() => {
        refreshAuth();
        window.addEventListener('storage', refreshAuth);
        return () => window.removeEventListener('storage', refreshAuth);
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
