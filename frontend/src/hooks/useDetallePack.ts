import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { PackDetalle } from '../types/Pack';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { calcularMedia, getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

export function useDetallePack() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const { addPackToCart } = useCart();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [pack, setPack] = useState<PackDetalle | null>(null);
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
                `/valoracion_packs?pack=${encodeURIComponent(`/api/packs/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            console.error('Error recargando valoraciones', err);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const resPack = await api.get<PackDetalle>(`/packs/${id}`);
                setPack(resPack.data);
                await recargarValoraciones();
            } catch (err) {
                console.error('Error cargando datos del pack', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const titulo = pack?.titulo ?? 'Sin título';
    const imagen = pack?.imagen ?? '';
    const imagenes = pack?.imagenes ?? [];
    const allImages = imagen ? [imagen, ...imagenes] : imagenes;
    const descripcion = pack?.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = pack?.precioOriginal ?? 0;
    const precioOferta = pack?.precioOferta ?? null;
    const stock = pack?.stock ?? 0;
    const tipoPack = pack?.tipoPack ?? 'Pack';
    const esServicio = tipoPack.toLowerCase().includes('tatuaje') || tipoPack.toLowerCase().includes('plantilla');
    const sinStock = stock <= 0;
    const media = calcularMedia(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);
    const creadorObj = typeof pack?.creador === 'object' && pack?.creador !== null ? pack.creador : null;
    const creadorNombre = creadorObj?.usuario?.nombre;
    const creadorApellidos = creadorObj?.usuario?.apellidos || '';
    const creadorTrabajadorId = (() => {
        const creador = pack?.creador as unknown;
        if (creador && typeof creador === 'object') {
            const id = (creador as { id?: number }).id;
            return typeof id === 'number' ? id : null;
        }
        if (typeof creador === 'string') {
            const last = creador.split('/').filter(Boolean).pop();
            const n = last ? Number(last) : NaN;
            return Number.isFinite(n) ? n : null;
        }
        return null;
    })();

    return {
        id,
        navigate,
        isLoggedIn,
        puedeVerCreador,
        addPackToCart,
        pack,
        valoraciones,
        loading,
        currentUserId,
        recargarValoraciones,
        titulo,
        imagen,
        allImages,
        descripcion,
        precioOriginal,
        precioOferta,
        stock,
        tipoPack,
        esServicio,
        sinStock,
        media,
        yaValoró,
        creadorNombre,
        creadorApellidos,
        creadorTrabajadorId
    };
}
