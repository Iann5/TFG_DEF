import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import type { ProductoRaw } from '../types/producto';
import type { RawProyecto } from '../types/proyecto';
import type { PackDetalle } from '../types/Pack';

function norm(s: unknown): string {
  return String(s ?? '').toLowerCase().trim();
}

export default function Buscar() {
  const location = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(location.search).get('q') ?? '';
  const query = norm(q);

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<ProductoRaw[]>([]);
  const [proyectos, setProyectos] = useState<RawProyecto[]>([]);
  const [packs, setPacks] = useState<PackDetalle[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get<ProductoRaw[]>('/productos'),
      api.get<RawProyecto[]>('/proyectos'),
      api.get<PackDetalle[]>('/packs'),
    ])
      .then(([pRes, prRes, pkRes]) => {
        if (!mounted) return;
        setProductos(Array.isArray(pRes.data) ? pRes.data : []);
        setProyectos(Array.isArray(prRes.data) ? prRes.data : []);
        setPacks(Array.isArray(pkRes.data) ? pkRes.data : []);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!query) return [];
    return productos.filter(p => {
      const hay = `${norm(p.nombre)} ${norm(p.descripcion)}`;
      return hay.includes(query);
    });
  }, [productos, query]);

  const proyectosFiltrados = useMemo(() => {
    if (!query) return [];
    return proyectos.filter(p => {
      const hay = `${norm(p.tituloTatuaje)} ${norm(p.nombre)} ${norm(p.descripcion)} ${norm(p.tipo)}`;
      return hay.includes(query);
    });
  }, [proyectos, query]);

  const packsFiltrados = useMemo(() => {
    if (!query) return [];
    return packs.filter(p => {
      const hay = `${norm(p.titulo)} ${norm(p.descripcion)} ${norm(p.tipoPack)}`;
      return hay.includes(query);
    });
  }, [packs, query]);

  const total = productosFiltrados.length + proyectosFiltrados.length + packsFiltrados.length;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1400px] w-full mx-auto">
          <div className="mb-12 border-b border-outline-variant/20 pb-8">
            <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">Búsqueda</span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">
              Resultados para <span className="text-primary italic">{q || '...'}</span>
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-3">
              {loading ? 'Buscando…' : `${total} resultado(s)`}
            </p>
          </div>

          {!query ? (
            <div className="glass-panel p-10 text-center">
              <p className="text-on-surface-variant font-body">Escribe algo en el buscador para ver resultados.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Productos */}
              <section className="glass-panel p-6 md:p-8">
                <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-6 border-b border-outline-variant/20 pb-4">
                  Productos <span className="text-outline-variant">({productosFiltrados.length})</span>
                </h2>
                {productosFiltrados.length === 0 ? (
                  <p className="text-on-surface-variant font-body text-sm">Sin resultados en productos.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productosFiltrados.map(p => (
                      <button
                        key={`prod-${p.id}`}
                        onClick={() => navigate(`/merchandising/${p.id}`)}
                        className="glass-panel p-4 text-left hover:-translate-y-1 transition-all duration-300 border-outline-variant/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-surface-container-highest border border-outline-variant/20 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                            {p.imagen ? <img src={p.imagen} alt={p.nombre ?? 'Producto'} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-outline-variant">image</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-headline font-bold uppercase tracking-wide text-on-surface truncate">{p.nombre ?? 'Producto'}</p>
                            {p.descripcion && <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{p.descripcion}</p>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Proyectos */}
              <section className="glass-panel p-6 md:p-8">
                <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-6 border-b border-outline-variant/20 pb-4">
                  Proyectos <span className="text-outline-variant">({proyectosFiltrados.length})</span>
                </h2>
                {proyectosFiltrados.length === 0 ? (
                  <p className="text-on-surface-variant font-body text-sm">Sin resultados en proyectos.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {proyectosFiltrados.map(p => (
                      <button
                        key={`proj-${p.id}`}
                        onClick={() => navigate(`/proyecto/${p.id}`)}
                        className="glass-panel p-4 text-left hover:-translate-y-1 transition-all duration-300 border-outline-variant/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-surface-container-highest border border-outline-variant/20 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                            {p.imagen ? <img src={p.imagen} alt={p.nombre ?? 'Proyecto'} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-outline-variant">image</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-headline font-bold uppercase tracking-wide text-on-surface truncate">{p.tituloTatuaje || p.nombre || 'Proyecto'}</p>
                            {p.descripcion && <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{p.descripcion}</p>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Packs */}
              <section className="glass-panel p-6 md:p-8">
                <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-6 border-b border-outline-variant/20 pb-4">
                  Packs <span className="text-outline-variant">({packsFiltrados.length})</span>
                </h2>
                {packsFiltrados.length === 0 ? (
                  <p className="text-on-surface-variant font-body text-sm">Sin resultados en packs.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packsFiltrados.map(pk => (
                      <button
                        key={`pack-${pk.id}`}
                        onClick={() => navigate(`/merchandising/pack/${pk.id}`)}
                        className="glass-panel p-4 text-left hover:-translate-y-1 transition-all duration-300 border-outline-variant/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-surface-container-highest border border-outline-variant/20 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                            {pk.imagen ? <img src={pk.imagen} alt={pk.titulo ?? 'Pack'} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-outline-variant">image</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-headline font-bold uppercase tracking-wide text-on-surface truncate">{pk.titulo ?? 'Pack'}</p>
                            {pk.descripcion && <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{pk.descripcion}</p>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

