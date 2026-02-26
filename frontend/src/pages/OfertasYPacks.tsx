import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// IMPORTAMOS LAS INTERFACES DESDE EL NUEVO ARCHIVO
import {
  type CategoriaPromo,
  type OrdenPromocion,
  type ValoracionBase,
  type ItemPromocional,
  type EstadoFiltros,
  type RawPack,
  type RawProducto,
  type RawProyecto
} from '../types/Oferta';

export default function OfertasYPacks() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [items, setItems] = useState<ItemPromocional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<EstadoFiltros>({
    busqueda: '',
    categorias: [],
    orden: 'reciente',
    filtroPacks: 'todos'
  });

  const calcularMedia = (vals: ValoracionBase[] | undefined): number => {
    if (!vals || vals.length === 0) return 0;
    const suma = vals.reduce((acc, v) => acc + v.estrellas, 0);
    return suma / vals.length;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPacks, resProds, resProjs] = await Promise.all([
        api.get<RawPack[]>('/packs'),
        api.get<RawProducto[]>('/productos'),
        api.get<RawProyecto[]>('/proyectos')
      ]);

      const rawPacks: RawPack[] = resPacks.data;
      const rawProds: RawProducto[] = resProds.data;
      const rawProjs: RawProyecto[] = resProjs.data;

      const packsMapeados: ItemPromocional[] = rawPacks.map(p => {
        let tipoCategoria: CategoriaPromo = 'servicio';
        const tipoMin = p.tipoDePack?.toLowerCase() || '';
        if (tipoMin.includes('producto')) tipoCategoria = 'producto';
        else if (tipoMin.includes('plantilla')) tipoCategoria = 'plantilla';

        return {
          idUnico: `pack-${p.id}`,
          dbId: p.id,
          titulo: p.nombrePack || 'Pack sin título',
          descripcion: p.descripcion || '',
          imagen: p.imagen || '',
          precioOriginal: p.precioOriginal || 0,
          precioOferta: p.precioOferta || null,
          tipo: tipoCategoria,
          esPack: true,
          fechaSubida: p.fecha_subida || new Date().toISOString(),
          valoracionMedia: 5
        };
      });

      const prodsMapeados: ItemPromocional[] = rawProds
        .filter(p => p.precio_oferta !== null && p.precio_oferta !== undefined)
        .map(p => ({
          idUnico: `prod-${p.id}`,
          dbId: p.id,
          titulo: p.nombre,
          descripcion: p.descripcion || '',
          imagen: p.imagen || '',
          precioOriginal: p.precio_original,
          precioOferta: p.precio_oferta || null,
          tipo: 'producto',
          esPack: false,
          fechaSubida: p.fecha_subida,
          valoracionMedia: calcularMedia(p.valoracionProductos)
        }));

      const projsMapeados: ItemPromocional[] = rawProjs
        .filter(p => p.precio_oferta !== null && p.precio_oferta !== undefined)
        .map(p => ({
          idUnico: `proj-${p.id}`,
          dbId: p.id,
          titulo: p.nombre,
          descripcion: p.descripcion || p.tipo,
          imagen: p.imagen || '',
          precioOriginal: p.precio_original,
          precioOferta: p.precio_oferta || null,
          tipo: p.tipo.toLowerCase().includes('plantilla') ? 'plantilla' : 'servicio',
          esPack: false,
          fechaSubida: p.fecha_subida,
          valoracionMedia: calcularMedia(p.valoracionProyectos)
        }));

      setItems([...packsMapeados, ...prodsMapeados, ...projsMapeados]);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error al cargar datos: ${err.response?.status}`);
      } else {
        setError("Error desconocido al cargar las promociones.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const itemsFiltrados = useMemo(() => {
    let resultado = items.filter(item =>
      item.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase())
    );

    if (filtros.categorias.length > 0) {
      resultado = resultado.filter(item => filtros.categorias.includes(item.tipo));
    }

    if (filtros.filtroPacks === 'solo-oferta') {
      resultado = resultado.filter(item => !item.esPack || (item.esPack && item.precioOferta !== null));
    } else if (filtros.filtroPacks === 'sin-oferta') {
      resultado = resultado.filter(item => !item.esPack || (item.esPack && item.precioOferta === null));
    }

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaSubida).getTime();
      const fechaB = new Date(b.fechaSubida).getTime();

      if (filtros.orden === 'reciente') return fechaB - fechaA;
      if (filtros.orden === 'antiguo') return fechaA - fechaB;
      if (filtros.orden === 'valoracionAlta') return b.valoracionMedia - a.valoracionMedia;
      if (filtros.orden === 'valoracionBaja') return a.valoracionMedia - b.valoracionMedia;
      return 0;
    });

    return resultado;
  }, [items, filtros]);

  const handleToggleCategoria = (cat: CategoriaPromo): void => {
    setFiltros(prev => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter(c => c !== cat)
        : [...prev.categorias, cat]
    }));
  };

  const handleEliminar = async (idUnico: string, dbId: number, esPack: boolean): Promise<void> => {
    if (!window.confirm("¿Seguro que deseas eliminar este elemento?")) return;
    try {
      const endpoint = esPack ? `/packs/${dbId}` : `/proyectos/${dbId}`;
      await api.delete(endpoint);
      setItems(prev => prev.filter(item => item.idUnico !== idUnico));
    } catch (err) {
      console.error("Error eliminando", err);
    }
  };

  return (
    <div className="bg-[#1C1B28] text-white relative">

      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}
      ></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-light text-center mb-10">Ofertas y <span className="text-sky-500 font-bold">Packs</span></h1>

          {/* --- PANEL DE FILTROS --- */}
          <div className="bg-[#2a2a2a] p-6 rounded-2xl mb-10 space-y-6 shadow-xl border border-gray-800">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="flex-1 bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 outline-none focus:border-sky-500 text-white transition-all"
                value={filtros.busqueda}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
              <select
                className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 outline-none text-white cursor-pointer hover:border-sky-500 transition-all"
                value={filtros.orden}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as OrdenPromocion })}
              >
                <option value="reciente">Novedades (Más recientes)</option>
                <option value="antiguo">Más antiguos</option>
                <option value="valoracionAlta">Mejor valorados a Menor</option>
                <option value="valoracionBaja">Menor valorados a Mayor</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-400 text-sm mr-2 uppercase tracking-wide font-bold">Filtrar por:</span>
                {(['servicio', 'plantilla', 'producto'] as CategoriaPromo[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleToggleCategoria(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all border ${filtros.categorias.includes(cat)
                        ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/30'
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {cat}s {filtros.categorias.includes(cat) ? '✓' : ''}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-gray-700 hidden md:block"></div>

              <select
                className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-700 outline-none text-sm text-gray-300 cursor-pointer"
                value={filtros.filtroPacks}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, filtroPacks: e.target.value as EstadoFiltros['filtroPacks'] })}
              >
                <option value="todos">Todos los Packs</option>
                <option value="solo-oferta">Solo Packs en Oferta</option>
                <option value="sin-oferta">Solo Packs sin Oferta</option>
              </select>
            </div>
          </div>

          {/* --- GRID DE RESULTADOS --- */}
          {error && <div className="text-red-500 text-center text-xl bg-red-900/20 p-4 rounded-xl border border-red-900">{error}</div>}
          {loading && !error && <div className="text-white text-center text-xl animate-pulse">Cargando la tienda...</div>}

          {!loading && !error && itemsFiltrados.length === 0 && (
            <div className="text-gray-500 text-center text-xl py-10">No se encontraron resultados para tu búsqueda.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {itemsFiltrados.map(item => {
              const ahorro = item.precioOferta ? item.precioOriginal - item.precioOferta : 0;
              const esCita = item.tipo === 'servicio' || item.tipo === 'plantilla';

              return (
                <div key={item.idUnico} className="bg-[#2a2a2a] rounded-2xl overflow-hidden flex flex-col border border-gray-800 hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-900/20 group">
                  {/* Cabecera / Imagen */}
                  <div className="relative h-64 bg-[#1a1a1a] overflow-hidden">
                    {item.imagen && (
                      <img
                        src={item.imagen}
                        alt={item.titulo}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.esPack && <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">Pack</span>}
                      {item.precioOferta && <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">Oferta</span>}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold group-hover:text-sky-400 transition-colors">{item.titulo}</h3>
                      <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-700">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs font-bold">{item.valoracionMedia > 0 ? item.valoracionMedia.toFixed(1) : 'Nuevo'}</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{item.descripcion}</p>

                    <div className="mt-auto space-y-4">
                      {/* Precios */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-green-400 font-bold text-3xl">
                          {item.precioOferta ? item.precioOferta.toFixed(2) : item.precioOriginal.toFixed(2)}€
                        </span>
                        {ahorro > 0 && <span className="text-gray-500 line-through text-sm">{item.precioOriginal.toFixed(2)}€</span>}
                      </div>

                      {/* Botón de Acción Principal - Corregido para Packs */}
                      <div className="mt-auto space-y-2">
                        <button
                        onClick={() => {
                          // Si el item es un Pack, usamos la nueva ruta de detalles de pack
                          if (item.esPack) {
                            navigate(`/merchandising/pack/${item.dbId}`);
                          } else {
                            // Si es un producto o proyecto normal, usamos sus rutas existentes
                            const esProyecto = item.tipo.toLowerCase().includes('tatuaje') || 
                                              item.tipo.toLowerCase().includes('plantilla');
                            
                            const rutaBase = esProyecto ? '/proyecto' : '/merchandising';
                            navigate(`${rutaBase}/${item.dbId}`);
                          }
                        }}
                        className="w-full py-2.5 bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
                      >
                        Ver Detalles
                      </button>

                        {/* Botón de Carrito (Solo si NO es pack o si es pack de productos) */}
                        {!item.tipo.toLowerCase().includes('tatuaje') && (
                          <button
                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/10 transition shadow-lg shadow-white/5 flex justify-center items-center gap-2"
                          >
                            🛒 Añadir al Carrito
                          </button>
                        )}
                      </div>

                      {/* Botones de Gestión (Solo Trabajador/Admin) */}
                      {puedeEditar && item.esPack && (
                        <div className="flex gap-2 pt-4 mt-2 border-t border-gray-700">
                          <button
                            onClick={() => navigate(`/editarPack/${item.dbId}`)}
                            className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/50 text-xs font-bold rounded-lg transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(item.idUnico, item.dbId, item.esPack)}
                            className="flex-1 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 text-xs font-bold rounded-lg transition"
                          >
                            🗑 Eliminar
                          </button>
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
