import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { type TrabajadorBasico } from '../types/trabajador';
import { type EstiloData } from '../types/EstiloInterface';

export function useEstilos() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [estilos, setEstilos] = useState<EstiloData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabajadores1, setTrabajadores1] = useState<TrabajadorBasico[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [orden, setOrden] = useState<string[]>(['az']);

  const cargar = async () => {
    try {
      const response = await api.get<EstiloData[]>('/estilos');
      if (Array.isArray(response.data)) setEstilos(response.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error ${err.response?.status}: No se pudo obtener la información.`);
      } else {
        setError('Error inesperado en la conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadores = async () => {
    try {
      const response = await api.get<TrabajadorBasico[]>('/trabajadors');
      if (Array.isArray(response.data)) {
        const trabajadoresActivos = response.data.filter((trabajador) => {
          const roles = trabajador.usuario?.roles ?? [];
          if (roles.length === 0) return true;
          return roles.includes('ROLE_TRABAJADOR') || roles.includes('ROLE_ADMIN');
        });
        setTrabajadores1(trabajadoresActivos);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error ${err.response?.status}: No se pudo obtener los trabajadores.`);
      } else {
        setError('Error inesperado en la conexión con trabajadores.');
      }
    }
  };

  useEffect(() => { 
    cargar(); 
    cargarTrabajadores(); 
  }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estilo permanentemente?')) return;
    try {
      await api.delete(`/estilos/${id}`);
      setEstilos(prev => prev.filter(e => e.id !== id));
    } catch {/* silencioso */}
  };

  const estilosProcesados = (() => {
    let list = [...estilos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        (e.informacion && e.informacion.toLowerCase().includes(query))
      );
    }

    const activo = orden[orden.length - 1] ?? 'az';
    if (activo === 'reciente') list.sort((a, b) => b.id - a.id);
    else if (activo === 'antiguo') list.sort((a, b) => a.id - b.id);
    else if (activo === 'za') list.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    else list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    return list;
  })();

  return {
    navigate,
    puedeEditar,
    loading,
    error,
    trabajadores1,
    searchQuery,
    setSearchQuery,
    orden,
    setOrden,
    estilosProcesados,
    handleEliminar
  };
}
