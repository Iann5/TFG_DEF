import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type DetalleRaw } from '../types/proyecto';
import { calcularMedia, getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

export function useDetalleProyecto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const isTrabajadorOrAdmin = hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN');

    const [proyecto, setProyecto] = useState<DetalleRaw | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
        setCurrentUserId(isLoggedIn ? getStoredUserId() : null);
    }, [isLoggedIn]);

    const recargarValoraciones = async () => {
        try {
            const res = await api.get<RawValoracion[]>(
                `/valoracion_proyectos?proyecto=${encodeURIComponent(`/api/proyectos/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch {
            // ignorar silenciosamente
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get<DetalleRaw>(`/proyectos/${id}`);
                setProyecto(res.data);
                await recargarValoraciones();
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const titulo = proyecto?.tituloTatuaje ?? proyecto?.nombre ?? 'Sin título';
    const imagen = proyecto?.imagen ?? '';
    const tipo = proyecto?.tipo ?? 'Tatuaje';
    const artista = proyecto?.autor?.usuario?.nombre
        ? `${proyecto.autor.usuario.nombre} ${proyecto.autor.usuario.apellidos || ''}`
        : proyecto?.nombreTrabajador ?? 'Desconocido';
    const descripcion = proyecto?.descripcion ?? '';
    const precioOriginal = proyecto?.precioOriginal ?? proyecto?.precio_original ?? 0;
    const precioOferta = proyecto?.precioOferta ?? proyecto?.precio_oferta ?? null;
    const media = calcularMedia(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);

    return {
        id,
        navigate,
        isLoggedIn,
        isTrabajadorOrAdmin,
        proyecto,
        valoraciones,
        loading,
        currentUserId,
        recargarValoraciones,
        titulo,
        imagen,
        tipo,
        artista,
        descripcion,
        precioOriginal,
        precioOferta,
        media,
        yaValoró
    };
}
