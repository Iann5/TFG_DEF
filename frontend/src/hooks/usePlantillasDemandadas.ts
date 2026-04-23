import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getFavoritesStorageKey } from '../utils/authUtils';
import { type RawProyecto, type ProyectoNormalizado, type FiltrosProyectos } from '../types/proyecto';

export function usePlantillasDemandadas() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [plantillas, setPlantillas] = useState<ProyectoNormalizado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [favoritos, setFavoritos] = useState<number[]>([]);

    const [filtros, setFiltros] = useState({
        busqueda: '',
        orden: 'reciente' as FiltrosProyectos['orden']
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const res = await api.get<RawProyecto[]>('/proyectos');

                let rawData: RawProyecto[] = res.data;

                rawData = rawData.filter((p: any) => {
                    if (p.autor && p.autor.usuario && p.autor.usuario.roles) {
                        return p.autor.usuario.roles.includes('ROLE_TRABAJADOR');
                    }
                    return true;
                });

                // 1. Filtramos solo las plantillas y normalizamos los datos
                const soloPlantillasNormalizadas: ProyectoNormalizado[] = rawData
                    .filter(p => (p.tipo || '').toLowerCase().includes('plantilla'))
                    .map(p => {
                        const valoraciones = p.valoracionProyectos || [];
                        return {
                            id: p.id,
                            titulo: p.tituloTatuaje || p.nombre || 'Plantilla sin título',
                            descripcion: p.descripcion || undefined,
                            estilo: p.estilo || 'Varios',
                            tipo: 'plantilla',
                            precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
                            precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
                            imagen: p.imagen || '',
                            nombreTrabajador: p.autor?.usuario?.nombre
                                ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
                                : 'Desconocido',
                            autorUserId: p.autorUserId ?? p.autor?.usuario?.id ?? null,
                            fechaSubida: p.fecha_subida || new Date().toISOString(),
                            valoraciones: valoraciones,
                            media: p.media || 0
                        };
                    });

                setPlantillas(soloPlantillasNormalizadas);

                // Cargar favoritos del LocalStorage solo si hay usuario logueado
                const storageKey = getFavoritesStorageKey();
                if (storageKey) {
                    const favsGuardados = localStorage.getItem(storageKey);
                    if (favsGuardados) setFavoritos(JSON.parse(favsGuardados));
                } else {
                    setFavoritos([]);
                }

            } catch (err) {
                if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [isLoggedIn]);

    const toggleFavorito = (id: number): void => {
        if (!isLoggedIn) return;

        const nuevosFavs = favoritos.includes(id)
            ? favoritos.filter(fId => fId !== id)
            : [...favoritos, id];

        setFavoritos(nuevosFavs);
        const storageKey = getFavoritesStorageKey();
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
    };

    const handleEliminar = async (id: number): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
        try {
            await api.delete(`/proyectos/${id}`);
            setPlantillas(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error eliminando", err);
        }
    };

    // --- Lógica de filtrado y ordenación ---
    const plantillasFiltradas = useMemo(() => {
        const resultado = plantillas.filter(p =>
            p.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase())
        );

        resultado.sort((a, b) => {
            const fechaA = new Date(a.fechaSubida).getTime();
            const fechaB = new Date(b.fechaSubida).getTime();

            if (filtros.orden === 'reciente') return fechaB - fechaA;
            if (filtros.orden === 'antiguo') return fechaA - fechaB;
            if (filtros.orden === 'valoracionAlta') return b.media - a.media;
            if (filtros.orden === 'valoracionBaja') return a.media - b.media;
            return 0;
        });

        return resultado;
    }, [plantillas, filtros]);

    // --- Separación Temporal: Mensual (Novedades) vs Anual (Populares) ---
    const { mensuales, anuales } = useMemo(() => {
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);

        return {
            mensuales: plantillasFiltradas.filter(p => new Date(p.fechaSubida) >= unMesAtras),
            anuales: plantillasFiltradas.filter(p => new Date(p.fechaSubida) < unMesAtras)
        };
    }, [plantillasFiltradas]);

    return {
        navigate,
        loading,
        error,
        favoritos,
        filtros,
        setFiltros,
        toggleFavorito,
        handleEliminar,
        plantillasFiltradas,
        mensuales,
        anuales
    };
}
