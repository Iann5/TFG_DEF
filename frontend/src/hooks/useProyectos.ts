import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getFavoritesStorageKey } from '../utils/authUtils';
import { type RawProyecto, type ProyectoNormalizado, type FiltrosProyectos } from '../types/proyecto';

export function useProyectos() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const esAdmin = isLoggedIn && hasRole('ROLE_ADMIN');
  const esTrabajador = isLoggedIn && hasRole('ROLE_TRABAJADOR');

  // ID del User autenticado — para comparar con el autorUserId de cada proyecto
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [proyectos, setProyectos] = useState<ProyectoNormalizado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // Función derivada: ¿puede editar/eliminar ESTE proyecto concreto?
  const puedeEditarProyecto = (proyecto: ProyectoNormalizado): boolean => {
    if (!isLoggedIn) return false;
    if (esAdmin) return true;                              // Admin puede todo
    if (!esTrabajador) return false;                       // No-trabajador nunca
    return proyecto.autorUserId === currentUserId;         // Solo el autor
  };

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

      // Filtrar proyectos cuyos autores ya no sean trabajadores
      rawData = rawData.filter((p: any) => {
          if (p.autor && p.autor.usuario && p.autor.usuario.roles) {
              return p.autor.usuario.roles.includes('ROLE_TRABAJADOR');
          }
          return true;
      });

      // Mapeo seguro a la interfaz normalizada
      const proyectosMapeados: ProyectoNormalizado[] = rawData.map(p => {
        const valoraciones = p.valoracionProyectos || [];
        // Resolvemos el autorUserId: primero del campo serializado, luego de la relación anidada
        const autorUserId = p.autorUserId ?? p.autor?.usuario?.id ?? null;
        return {
          id: p.id,
          titulo: p.tituloTatuaje || p.nombre || 'Sin título',
          descripcion: p.descripcion || undefined,
          estilo: p.estilo || 'Varios',
          tipo: p.tipo || 'tatuaje',
          precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
          precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
          imagen: p.imagen || '',
          nombreTrabajador: p.autor?.usuario?.nombre
            ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
            : 'Desconocido',
          autorUserId,
          fechaSubida: p.fechaSubida || p.fecha_subida || new Date(0).toISOString(),
          valoraciones: valoraciones,
          media: p.media || 0
        };
      });

      setProyectos(proyectosMapeados);

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

  // Cargar proyectos + ID del usuario actual (solo si está logueado)
  useEffect(() => {
    cargarDatos();
    if (isLoggedIn) {
      api.get('/me')
        .then(res => setCurrentUserId(res.data.id ?? null))
        .catch(() => setCurrentUserId(null));
    } else {
      setCurrentUserId(null);
      setFavoritos([]);
    }
  }, [isLoggedIn]);

  const toggleFavorito = (id: number): void => {
    if (!isLoggedIn) return;

    const nuevosFavs = favoritos.includes(id) ? favoritos.filter(fId => fId !== id) : [...favoritos, id];
    setFavoritos(nuevosFavs);
    const storageKey = getFavoritesStorageKey();
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
  };

  const handleEliminar = async (id: number): Promise<void> => {
    if (!window.confirm('¿Seguro que deseas eliminar este proyecto?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      setProyectos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error eliminando", err);
    }
  };

  const trabajadoresUnicos = useMemo(() => {
    return Array.from(new Set(proyectos.map(p => p.nombreTrabajador)));
  }, [proyectos]);

  // Lógica Top Mes
  const topDelMes = useMemo(() => {
    const now = new Date();
    const proyectosEsteMes = proyectos.filter(p => {
      const fecha = new Date(p.fechaSubida);
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    });

    const ordenados = [...proyectosEsteMes].sort((a, b) => b.media - a.media);
    return {
      mejorTatuaje: ordenados.find(p => p.tipo.toLowerCase().includes('tatuaje')),
      mejorPlantilla: ordenados.find(p => p.tipo.toLowerCase().includes('plantilla'))
    };
  }, [proyectos]);

  // Lógica Filtrado
  const proyectosFiltrados = useMemo(() => {
    let resultado = [...proyectos];
    if (filtros.tipo !== 'todos') resultado = resultado.filter(p => p.tipo.toLowerCase().includes(filtros.tipo));
    if (filtros.trabajador !== 'todos') resultado = resultado.filter(p => p.nombreTrabajador === filtros.trabajador);

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaSubida).getTime();
      const fechaB = new Date(b.fechaSubida).getTime();

      if (filtros.orden === 'reciente') {
        if (fechaA === fechaB) return b.id - a.id;
        return fechaB - fechaA;
      }
      if (filtros.orden === 'antiguo') {
        if (fechaA === fechaB) return a.id - b.id;
        return fechaA - fechaB;
      }
      if (filtros.orden === 'valoracionAlta') return b.media - a.media;
      if (filtros.orden === 'valoracionBaja') return a.media - b.media;

      return 0;
    });
    return resultado;
  }, [proyectos, filtros]);

  return {
    navigate,
    esAdmin,
    esTrabajador,
    loading,
    error,
    favoritos,
    filtros,
    setFiltros,
    puedeEditarProyecto,
    toggleFavorito,
    handleEliminar,
    trabajadoresUnicos,
    topDelMes,
    proyectosFiltrados
  };
}
