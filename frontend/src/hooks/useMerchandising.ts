import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { type ProductoRaw } from '../types/producto';

export type OrdenMerchandising = 'reciente' | 'antiguo' | 'valoracionAlta' | 'valoracionBaja';

export function useMerchandising() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';
  const { hasRole, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [productos, setProductos] = useState<ProductoRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orden, setOrden] = useState<OrdenMerchandising>('reciente');

  const cargar = async () => {
    try {
      const res = await api.get<ProductoRaw[]>('/productos');
      setProductos(res.data);
    } catch (err) {
      if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch { /* silencioso */ }
  };

  const getFecha = (p: ProductoRaw): number => {
    const raw = p.fechaSubida ?? p.fecha_subida;
    return raw ? new Date(raw).getTime() : 0;
  };

  const getPrecioOriginal = (p: ProductoRaw) => p.precioOriginal ?? p.precio_original ?? 0;
  const getPrecioOferta = (p: ProductoRaw): number | null => p.precioOferta ?? p.precio_oferta ?? null;

  const productosFiltrados = useMemo(() => {
    const resultado = searchQuery
      ? productos.filter(p =>
        p.nombre?.toLowerCase().includes(searchQuery) ||
        p.descripcion?.toLowerCase().includes(searchQuery)
      )
      : [...productos];

    resultado.sort((a, b) => {
      const fechaA = getFecha(a);
      const fechaB = getFecha(b);
      if (orden === 'reciente') return fechaB !== fechaA ? fechaB - fechaA : b.id - a.id;
      if (orden === 'antiguo') return fechaA !== fechaB ? fechaA - fechaB : a.id - b.id;
      if (orden === 'valoracionAlta') return (b.media ?? 0) - (a.media ?? 0);
      if (orden === 'valoracionBaja') return (a.media ?? 0) - (b.media ?? 0);
      return 0;
    });
    return resultado;
  }, [productos, orden, searchQuery]);

  return {
    navigate,
    puedeEditar,
    loading,
    error,
    orden,
    setOrden,
    productosFiltrados,
    handleEliminar,
    getPrecioOriginal,
    getPrecioOferta,
    addToCart
  };
}
