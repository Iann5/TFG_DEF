import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { type PedidoRaw, type UserMini, type FiltroRol } from '../types/historial';

export function useHistorial() {
    const [pedidos, setPedidos] = useState<PedidoRaw[]>([]);
    const [usuarios, setUsuarios] = useState<UserMini[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [filtroRol, setFiltroRol] = useState<FiltroRol>('TODOS');
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UserMini | null>(null);

    useEffect(() => {
        Promise.all([
            api.get('/pedidos'),
            api.get('/users')
        ])
            .then(([resPedidos, resUsers]) => {
                const dataPedidos = Array.isArray(resPedidos.data) ? resPedidos.data : (resPedidos.data['hydra:member'] || []);
                const sortedData = dataPedidos.sort((a: PedidoRaw, b: PedidoRaw) => b.id - a.id);
                setPedidos(sortedData);

                const dataUsers = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data['hydra:member'] || []);
                setUsuarios(dataUsers);
            })
            .catch(err => console.error("Error cargando historial:", err))
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = (id: number) => {
        setExpanded(prev => prev === id ? null : id);
    };

    const parseIdFromIri = (iri: string): number | null => {
        const last = iri.split('/').filter(Boolean).pop();
        const n = last ? Number(last) : NaN;
        return Number.isFinite(n) ? n : null;
    };

    const getPedidoUsuarioId = (pedido: PedidoRaw): number | null => {
        const u = pedido.usuario;
        if (!u) return null;
        if (typeof u === 'string') return parseIdFromIri(u);
        return typeof u.id === 'number' ? u.id : null;
    };

    const getPedidoUsuarioNombre = (pedido: PedidoRaw): string => {
        const userId = getPedidoUsuarioId(pedido);
        const fromList = userId ? usuarios.find(u => u.id === userId) : null;

        if (typeof pedido.usuario === 'object' && pedido.usuario) {
            const nombre = pedido.usuario.nombre || fromList?.nombre || '';
            const apellidos = pedido.usuario.apellidos || fromList?.apellidos || '';
            return `${nombre} ${apellidos}`.trim() || `Usuario #${userId ?? '?'}`;
        }

        if (fromList) {
            return `${fromList.nombre || ''} ${fromList.apellidos || ''}`.trim() || `Usuario #${fromList.id}`;
        }

        return `Usuario #${userId ?? '?'}`;
    };

    const getPedidoUsuarioEmail = (pedido: PedidoRaw): string => {
        const userId = getPedidoUsuarioId(pedido);
        const fromList = userId ? usuarios.find(u => u.id === userId) : null;
        if (typeof pedido.usuario === 'object' && pedido.usuario?.email) return pedido.usuario.email;
        return fromList?.email || 'Email no disponible';
    };

    const getTipoRol = (roles: string[] = []): FiltroRol => {
        if (roles.includes('ROLE_ADMIN')) return 'ADMIN';
        if (roles.includes('ROLE_TRABAJADOR')) return 'TRABAJADOR';
        return 'USUARIO';
    };

    const usuariosFiltrados = useMemo(() => {
        const texto = busquedaUsuario.trim().toLowerCase();
        return usuarios.filter(user => {
            const roleMatch = filtroRol === 'TODOS' ? true : getTipoRol(user.roles || []) === filtroRol;
            const nombreCompleto = `${user.nombre || ''} ${user.apellidos || ''}`.trim().toLowerCase();
            const searchMatch = texto.length === 0 ? true : nombreCompleto.includes(texto);
            return roleMatch && searchMatch;
        });
    }, [usuarios, filtroRol, busquedaUsuario]);

    const pedidosMostrados = useMemo(() => {
        let filtrados = pedidos;

        if (usuarioSeleccionado?.id) {
            filtrados = filtrados.filter(p => getPedidoUsuarioId(p) === usuarioSeleccionado.id);
        } else {
            if (filtroRol !== 'TODOS' || busquedaUsuario.trim() !== '') {
                const texto = busquedaUsuario.trim().toLowerCase();
                
                filtrados = filtrados.filter(p => {
                    const userId = getPedidoUsuarioId(p);
                    const user = userId ? usuarios.find(u => u.id === userId) : null;
                    
                    const roleMatch = filtroRol === 'TODOS' ? true : getTipoRol(user?.roles || []) === filtroRol;
                    
                    let searchMatch = true;
                    if (texto.length > 0) {
                        const nombreCompleto = user 
                            ? `${user.nombre || ''} ${user.apellidos || ''}`.trim().toLowerCase()
                            : getPedidoUsuarioNombre(p).toLowerCase();
                        searchMatch = nombreCompleto.includes(texto);
                    }
                    
                    return roleMatch && searchMatch;
                });
            }
        }

        return filtrados;
    }, [pedidos, usuarioSeleccionado, filtroRol, busquedaUsuario, usuarios]);

    return {
        loading,
        expanded,
        filtroRol,
        setFiltroRol,
        busquedaUsuario,
        setBusquedaUsuario,
        usuarioSeleccionado,
        setUsuarioSeleccionado,
        toggleExpand,
        getPedidoUsuarioNombre,
        getPedidoUsuarioEmail,
        getTipoRol,
        usuariosFiltrados,
        pedidosMostrados
    };
}
