import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getFavoritesStorageKey } from '../utils/authUtils';
import { type RawProyecto, type ProyectoNormalizado, type FiltrosProyectos } from '../types/proyecto';

export function useProyectosMasGustados() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [topProyectos, setTopProyectos] = useState<ProyectoNormalizado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [favoritos, setFavoritos] = useState<number[]>([]);

    const [filtros, setFiltros] = useState<FiltrosProyectos>({
        orden: 'reciente',
        tipo: 'todos',
        trabajador: 'todos'
    });

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

            const todosProyectos: ProyectoNormalizado[] = rawData.map(p => {
                const valoraciones = p.valoracionProyectos || [];
                return {
                    id: p.id,
                    titulo: p.tituloTatuaje || p.nombre || 'Sin título',
                    descripcion: p.descripcion || undefined,
                    estilo: p.estilo || 'Varios',
                    tipo: (p.tipo || 'tatuaje').toLowerCase(),
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

            // LÓGICA CORE: Agrupar por mes/año y sacar los ganadores
            const agrupadosPorMes: Record<string, ProyectoNormalizado[]> = {};

            todosProyectos.forEach(p => {
                const fecha = new Date(p.fechaSubida);
                const llaveMesAnio = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                if (!agrupadosPorMes[llaveMesAnio]) agrupadosPorMes[llaveMesAnio] = [];
                agrupadosPorMes[llaveMesAnio].push(p);
            });

            const ganadoresHistoricos: ProyectoNormalizado[] = [];

            Object.values(agrupadosPorMes).forEach(proyectosDelMes => {
                const tatuajes = proyectosDelMes.filter(p => p.tipo.includes('tatuaje')).sort((a, b) => b.media - a.media);
                const plantillas = proyectosDelMes.filter(p => p.tipo.includes('plantilla')).sort((a, b) => b.media - a.media);

                if (tatuajes.length > 0) ganadoresHistoricos.push(tatuajes[0]);
                if (plantillas.length > 0) ganadoresHistoricos.push(plantillas[0]);
            });

            setTopProyectos(ganadoresHistoricos);

            const storageKey = getFavoritesStorageKey();
            if (storageKey) {
                const favs = localStorage.getItem(storageKey);
                if (favs) setFavoritos(JSON.parse(favs));
            } else {
                setFavoritos([]);
            }
        } catch (err) {
            if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [isLoggedIn]);

    const toggleFavorito = (id: number): void => {
        if (!isLoggedIn) return;

        const nuevosFavs = favoritos.includes(id) ? favoritos.filter(fId => fId !== id) : [...favoritos, id];
        setFavoritos(nuevosFavs);
        const storageKey = getFavoritesStorageKey();
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
    };

    const handleEliminar = async (id: number): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar este proyecto ganador?')) return;
        try {
            await api.delete(`/proyectos/${id}`);
            setTopProyectos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error eliminando", err);
        }
    };

    const proyectosFiltrados = useMemo(() => {
        let resultado = [...topProyectos];

        if (filtros.tipo !== 'todos') {
            resultado = resultado.filter(p => p.tipo.includes(filtros.tipo));
        }

        if (filtros.trabajador !== 'todos') {
            resultado = resultado.filter(p => p.nombreTrabajador === filtros.trabajador);
        }

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
    }, [topProyectos, filtros]);

    return {
        navigate,
        loading,
        error,
        favoritos,
        filtros,
        setFiltros,
        toggleFavorito,
        handleEliminar,
        proyectosFiltrados
    };
}
