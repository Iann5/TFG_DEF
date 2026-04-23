import { type ChangeEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListaProyectos from '../components/ListaProyecto';
import TarjetaProyecto from '../components/TarjetaProyecto';
import { type FiltrosProyectos } from '../types/proyecto';
import { useProyectos } from '../hooks/useProyectos';

export default function Proyectos() {
  const {
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
  } = useProyectos();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="relative">
              <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Portafolio & Galería</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                Nuestros<br/>
                <span className="text-outline-variant">Proyectos</span>
              </h1>
              {/* Decorative elements */}
              <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
              <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
            </div>

            {(esTrabajador || esAdmin) && (
              <button
                onClick={() => navigate('/addTatuaje')}
                className="group relative overflow-hidden bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all duration-300"
              >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Añadir Proyecto
                </span>
              </button>
            )}
          </div>

          {/* TOP DEL MES */}
          {(topDelMes.mejorTatuaje || topDelMes.mejorPlantilla) && (
            <section className="mb-20 glass-panel p-8 md:p-12 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">star</span>
                 </div>
                 <div>
                    <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-widest text-on-surface">Proyectos más gustados</h2>
                    <p className="font-label text-xs text-outline tracking-[0.2em] uppercase">Lo mejor de este mes</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
                <div className="lg:col-span-1 hidden lg:block"></div> {/* Spacer to center or align */}
                {topDelMes.mejorTatuaje && (
                  <div className="lg:col-span-1">
                    <TarjetaProyecto
                      proyecto={topDelMes.mejorTatuaje}
                      esFavorito={false} onToggleFav={() => { }} puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                    />
                  </div>
                )}
                {topDelMes.mejorPlantilla && (
                  <div className="lg:col-span-1">
                    <TarjetaProyecto
                      proyecto={topDelMes.mejorPlantilla}
                      esFavorito={favoritos.includes(topDelMes.mejorPlantilla.id)}
                      onToggleFav={toggleFavorito}
                      puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* FILTROS */}
          <div className="glass-panel p-6 mb-16 flex flex-col xl:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 text-on-surface font-label text-sm uppercase tracking-widest w-full xl:w-auto shrink-0 border-b xl:border-b-0 xl:border-r border-outline-variant/30 pb-4 xl:pb-0 xl:pr-6">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtrar Galería
            </div>
            
            <div className="flex flex-wrap flex-grow gap-4 w-full">
              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">swap_vert</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.orden}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                 >
                   <option value="reciente">Más Recientes</option>
                   <option value="antiguo">Más Antiguos</option>
                   <option value="valoracionAlta">Mayor Valoración</option>
                   <option value="valoracionBaja">Menor Valoración</option>
                 </select>
              </div>

              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">category</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.tipo}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
                 >
                   <option value="todos">Todos los Tipos</option>
                   <option value="tatuaje">Solo Tatuajes</option>
                   <option value="plantilla">Solo Plantillas</option>
                 </select>
              </div>

              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">person</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.trabajador}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, trabajador: e.target.value })}
                 >
                   <option value="todos">Cualquier Artista</option>
                   {trabajadoresUnicos.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
            </div>
          </div>

          {/* RENDERIZADO DEL COMPONENTE LISTA */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
               <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
               <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando portafolio...</p>
             </div>
          )}
          
          {error && (
            <div className="bg-error-container/20 border border-error/50 p-6 rounded-sm flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-error text-sm">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <ListaProyectos
              proyectos={proyectosFiltrados}
              favoritos={favoritos}
              onToggleFav={toggleFavorito}
              puedeEditarFn={puedeEditarProyecto}
              navigate={navigate}
              onEliminar={handleEliminar}
            />
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
}