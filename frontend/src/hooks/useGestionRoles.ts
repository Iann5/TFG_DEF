import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type UserPerfil } from '../types/trabajador';

export function useGestionRoles() {
    const navigate = useNavigate();
    const { isLoggedIn, hasRole, refreshAuth } = useAuth();
    const [users, setUsers] = useState<UserPerfil[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        if (!hasRole('ROLE_ADMIN')) {
            navigate('/perfil');
            return;
        }

        fetchUsers();
    }, [isLoggedIn, hasRole, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get<UserPerfil[]>('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            setError("Error al cargar la lista de usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const rolesPayload = newRole === 'ROLE_ADMIN'
                ? ['ROLE_ADMIN', 'ROLE_USER']
                : newRole === 'ROLE_TRABAJADOR'
                    ? ['ROLE_TRABAJADOR', 'ROLE_USER']
                    : ['ROLE_USER'];

            await api.patch(`/users/${userId}`, {
                roles: rolesPayload
            }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });

            // Update local state
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: rolesPayload } : u));

            // Si el admin se cambia su propio rol, reflejar permisos inmediatamente
            const currentUserId = Number(localStorage.getItem('userId'));
            if (Number.isFinite(currentUserId) && currentUserId === userId) {
                await refreshAuth();
            }
        } catch (err) {
            console.error("Error al cambiar rol:", err);
            alert("Hubo un error al actualizar el rol.");
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const fullName = `${u.nombre || ''} ${u.apellidos || ''}`.toLowerCase();
        const searchMatch = fullName.includes(searchTerm.toLowerCase());

        let roleMatch = true;
        if (roleFilter === 'ADMIN') {
            roleMatch = u.roles.includes('ROLE_ADMIN');
        } else if (roleFilter === 'TRABAJADOR') {
            roleMatch = u.roles.includes('ROLE_TRABAJADOR') && !u.roles.includes('ROLE_ADMIN');
        } else if (roleFilter === 'USER') {
            roleMatch = !u.roles.includes('ROLE_TRABAJADOR') && !u.roles.includes('ROLE_ADMIN');
        }

        return searchMatch && roleMatch;
    });

    return {
        navigate,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        filteredUsers,
        handleRoleChange
    };
}
