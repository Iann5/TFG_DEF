import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Star, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageBackground from '../components/PageBackground';
import PrecioOferta from '../components/PrecioOferta';
import BotonesAdmin from '../components/BotonesAdmin';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { type ProductoRaw } from '../types/producto';

type OrdenMerchandising = 'reciente' | 'antiguo' | 'valoracionAlta' | 'valoracionBaja';

export default function Merchandising() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';
  const { hasRole, isLoggedIn } = useAuth();
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
    if (!confirm('¿Eliminar este producto?')) return;
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

  return (
    <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
      <PageBackground opacity={0.15} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold uppercase text-white">Merchandising</h1>
            {puedeEditar && (
              <button
                onClick={() => navigate('/addProducto')}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition"
              >
                + Añadir Producto
              </button>
            )}
          </div>

          {loading && <p className="text-white text-center text-xl">Cargando productos...</p>}
          {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>}

          {/* Filtros */}
          <div className="bg-[#323444]/80 p-6 rounded-2xl border border-white/5 mb-10 flex flex-col md:flex-row gap-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-white/50 font-bold uppercase text-sm tracking-wider w-full md:w-auto">
              <Filter size={20} /> Filtrar Galería
            </div>
            <div className="flex flex-wrap flex-grow gap-4">
              <select
                className="bg-[#1C1B28] text-white border border-[#3B82F6]/30 p-3 rounded-xl outline-none focus:border-sky-500 flex-1 min-w-[150px]"
                value={orden}
                onChange={e => setOrden(e.target.value as OrdenMerchandising)}
              >
                <option value="reciente">Más recientes</option>
                <option value="antiguo">Más antiguos</option>
                <option value="valoracionAlta">Mayor valoración</option>
                <option value="valoracionBaja">Menor valoración</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map(p => {
              const precioOriginal = getPrecioOriginal(p);
              const precioOferta = getPrecioOferta(p);
              return (
                <div key={p.id} className="bg-[#323444] border border-[#3B82F6]/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col group hover:border-sky-500 transition-all duration-300">
                  <div className="h-52 bg-white overflow-hidden">
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre ?? 'Producto'} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 opacity-90" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-4xl">IMG</div>
                    }
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-bold text-xl leading-tight group-hover:text-sky-400 transition-colors">{p.nombre ?? 'Sin título'}</h3>
                        {puedeEditar && p.creador?.usuario?.nombre && (
                          <p className="text-sky-400/80 text-xs font-semibold mt-1">
                            por {p.creador.usuario.nombre} {p.creador.usuario.apellidos ?? ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                        <Star size={14} className={(p.media ?? 0) > 0 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'} />
                        <span className="text-xs font-bold text-white/80">{(p.media ?? 0) > 0 ? (p.media!).toFixed(1) : 'Nuevo'}</span>
                      </div>
                    </div>

                    {p.descripcion && <p className="text-white/50 text-xs">{p.descripcion}</p>}
                    {p.stock != null && <span className="text-white/40 text-xs font-medium">Stock: {p.stock}</span>}

                    <div className="flex items-center gap-2 mb-4 mt-auto pt-4">
                      <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} size="sm" />
                    </div>

                    <div className="mt-auto">
                      <button
                        onClick={() => navigate(`/merchandising/${p.id}`)}
                        className="w-full py-2 mb-3 bg-sky-700/60 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition"
                      >
                        🔍 Ver detalles
                      </button>
                      <button className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/10 transition flex justify-center items-center gap-2">
                        🛒 Añadir al Carrito
                      </button>
                      {puedeEditar && (
                        <div className="pt-4 border-t border-white/10 mt-2">
                          <BotonesAdmin
                            onEditar={() => navigate(`/editarProducto/${p.id}`)}
                            onEliminar={() => handleEliminar(p.id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}