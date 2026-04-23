import { Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrecioOferta from '../components/PrecioOferta';
import { useMerchandising, type OrdenMerchandising } from '../hooks/useMerchandising';

export default function Merchandising() {
  const {
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
  } = useMerchandising();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1400px] w-full mx-auto">
          {/* HEADER SECTION */}
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="relative">
              <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Tienda Oficial</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                Merchan<br/>
                <span className="text-outline-variant">dising</span>
              </h1>
              {/* Decorative elements */}
              <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
              <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
            </div>

            {puedeEditar && (
               <button
                 onClick={() => navigate('/addProducto')}
                 className="group relative overflow-hidden bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all duration-300"
               >
                 <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                 <span className="relative z-10 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">add</span>
                   Añadir Producto
                 </span>
               </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
               <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
               <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando catálogo...</p>
            </div>
          )}

          {error && (
            <div className="bg-error-container/20 border border-error/50 p-6 rounded-sm flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-error text-sm">{error}</p>
            </div>
          )}

          {/* Filtros */}
          <div className="glass-panel p-6 mb-16 flex flex-col xl:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 text-on-surface font-label text-sm uppercase tracking-widest w-full xl:w-auto shrink-0 border-b xl:border-b-0 xl:border-r border-outline-variant/30 pb-4 xl:pb-0 xl:pr-6">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtrar Galería
            </div>
            <div className="flex flex-wrap flex-grow gap-4 w-full">
              <div className="flex-1 min-w-[250px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">swap_vert</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={orden}
                   onChange={e => setOrden(e.target.value as OrdenMerchandising)}
                 >
                   <option value="reciente">Novedades (Más Recientes)</option>
                   <option value="antiguo">Clásicos (Más Antiguos)</option>
                   <option value="valoracionAlta">Top Valorados</option>
                   <option value="valoracionBaja">Menos Valorados</option>
                 </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productosFiltrados.map(p => {
              const precioOriginal = getPrecioOriginal(p);
              const precioOferta = getPrecioOferta(p);

              return (
                <div key={p.id} className="glass-panel flex flex-col group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden h-full border-outline-variant/30">
                  <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none mix-blend-overlay"></div>

                  <div className="h-[280px] bg-surface-container-highest border-b border-outline-variant/20 overflow-hidden relative p-6 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/merchandising/${p.id}`)}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre ?? 'Producto'} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700 relative z-0 group-hover:scale-105" />
                      : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant border border-outline-variant/20 bg-surface-container relative">
                           <div className="absolute inset-0 bg-halftone opacity-30"></div>
                           <span className="material-symbols-outlined text-4xl relative z-10">image</span>
                        </div>
                      )
                    }
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
                        <span className="text-error font-headline text-3xl font-black uppercase tracking-[0.2em] -rotate-12 border-2 border-error px-4 py-2 bg-background/50">Agotado</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-surface-container/50 to-surface-container">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-on-surface font-headline text-xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors cursor-pointer line-clamp-2" onClick={() => navigate(`/merchandising/${p.id}`)}>
                          {p.nombre ?? 'Sin título'}
                        </h3>
                        {p.creador?.usuario?.nombre && (
                          <div className="flex items-center gap-1.5 opacity-80 mt-2">
                             <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                             <span className="text-on-surface-variant font-body text-[10px] uppercase tracking-wider">Creador: <span className="text-on-surface font-semibold">{p.creador.usuario.nombre} {p.creador.usuario.apellidos ?? ''}</span></span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-1 border border-outline-variant/30 rounded-sm shrink-0">
                        <Star size={12} strokeWidth={2} className={(p.media ?? 0) > 0 ? 'text-primary fill-primary' : 'text-outline'} />
                        <span className="text-[10px] font-label font-bold tracking-widest text-on-surface-variant">{(p.media ?? 0) > 0 ? (p.media!).toFixed(1) : 'NEW'}</span>
                      </div>
                    </div>

                    {p.descripcion && <p className="text-on-surface-variant font-body text-xs line-clamp-2 italic mb-4">"{p.descripcion}"</p>}
                    
                    {p.stock != null && (
                       <span className={`font-label text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-sm w-fit mb-4 ${
                         p.stock === 0
                           ? 'bg-error/55 text-white border-error/60'
                           : 'bg-primary/55 text-white border-primary/60'
                       }`}>
                         Stock: {p.stock}
                       </span>
                    )}

                    <div className="mt-auto mb-6 pb-4 border-b border-outline-variant/20">
                      <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} size="sm" />
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/merchandising/${p.id}`)}
                        className="w-full py-3 bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest transition-all duration-300 rounded-sm text-center"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => addToCart(p, 1)}
                        disabled={p.stock === 0}
                        className={`w-full py-3 font-label text-xs uppercase tracking-widest transition-all duration-300 rounded-sm flex justify-center items-center gap-2 ${
                           p.stock === 0 
                           ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                           : 'primary-gradient-cta'
                        }`}
                      >
                        {p.stock === 0 ? (
                           <>
                             <span className="material-symbols-outlined text-[14px]">remove_shopping_cart</span>
                             No hay stock
                           </>
                        ) : (
                           <div className="cta-content">
                             <span>Añadir al Carro</span>
                             <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                           </div>
                        )}
                      </button>

                      {puedeEditar && (
                        <div className="flex gap-3 pt-4 mt-2 border-t border-outline-variant/20">
                          <button
                            onClick={() => navigate(`/editarProducto/${p.id}`)}
                            className="flex-1 py-1.5 bg-surface-container-highest hover:bg-white text-on-surface hover:text-background border border-outline-variant/30 hover:border-white font-label text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span> Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(p.id)}
                            className="flex-1 py-1.5 bg-error-container/50 hover:bg-error text-error hover:text-on-error border border-error/50 font-label text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span> Elimin.
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