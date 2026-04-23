import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type ProductoRaw } from '../types/producto';
import { calcularMedia, getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

export function useDetalleProducto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const { addToCart } = useCart();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [producto, setProducto] = useState<ProductoRaw | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
        setCurrentUserId(isLoggedIn ? getStoredUserId() : null);
    }, [isLoggedIn]);

    const recargarValoraciones = async () => {
        try {
            const res = await api.get<RawValoracion[]>(
                `/valoracion_productos?producto=${encodeURIComponent(`/api/productos/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error('Error cargando valoraciones:', err.response?.data);
            } else {
                console.error('Error desconocido:', err);
            }
        }
    };

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await api.get<ProductoRaw>(`/productos/${id}`);
                setProducto(res.data);
                await recargarValoraciones();
            } catch (err) {
                console.error('Error al cargar producto:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const nombre = producto?.nombre ?? 'Sin nombre';
    const imagenPrincipal = producto?.imagen ?? '';
    const imagenesAdicionales = producto?.imagenes ?? [];
    const allImages = imagenPrincipal ? [imagenPrincipal, ...imagenesAdicionales] : imagenesAdicionales;
    const descripcion = producto?.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = producto?.precio_original ?? 0;
    const precioOferta = producto?.precio_oferta ?? null;
    const stock = producto?.stock ?? 0;
    const media = calcularMedia(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);

    return {
        id,
        navigate,
        isLoggedIn,
        puedeVerCreador,
        addToCart,
        producto,
        valoraciones,
        loading,
        currentUserId,
        recargarValoraciones,
        nombre,
        allImages,
        descripcion,
        precioOriginal,
        precioOferta,
        stock,
        media,
        yaValoró
    };
}
