import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Producto {
  id: number;
  nombreProducto: string;
  descripcion?: string;
  precioOriginal?: number;
  precioOferta?: number;
  stock?: number;
  imagen?: string;
}

export default function Merchandising() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    try {
      const res = await api.get<Producto[]>('/productos');
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
    } catch {/* silencioso */ }
  };

  return (
    <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', opacity: 0.15, filter: 'invert(1)' }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Merchandising</h1>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map(p => (
              <div key={p.id} className="bg-[#323444] border border-[#3B82F6]/50 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="aspect-square bg-[#9CA3AF] overflow-hidden">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombreProducto} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-4xl">IMG</div>
                  }
                </div>

                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h3 className="text-white font-bold text-base leading-tight">{p.nombreProducto}</h3>
                  {p.descripcion && <p className="text-white/50 text-xs">{p.descripcion}</p>}
                  {p.stock != null && (
                    <span className="text-white/40 text-xs">Stock: {p.stock}</span>
                  )}
                  <div className="flex items-baseline gap-2 mt-auto pt-2">
                    {p.precioOferta != null && p.precioOferta < (p.precioOriginal ?? Infinity) && (
                      <span className="text-white/40 line-through text-sm">{p.precioOriginal?.toFixed(2)}€</span>
                    )}
                    <span className="text-white font-bold text-xl">
                      {p.precioOferta?.toFixed(2) ?? p.precioOriginal?.toFixed(2)}€
                    </span>
                  </div>

                  {puedeEditar ? (
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => navigate(`/merchandising/${p.id}`)}
                        className="w-full py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white text-sm font-bold rounded-lg transition"
                      >
                        👁 Ver detalle
                      </button>
                      <div className="flex gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => navigate(`/editarProducto/${p.id}`)}
                          className="flex-1 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(p.id)}
                          className="flex-1 py-1.5 bg-red-700/80 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition"
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/merchandising/${p.id}`)}
                      className="w-full py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white text-sm font-bold rounded-lg transition mt-2"
                    >
                      👁 Ver detalle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}