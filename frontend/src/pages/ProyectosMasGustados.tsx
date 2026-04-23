import { type ChangeEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// REUTILIZAMOS TIPOS Y COMPONENTES (Cero duplicidades, cero 'any')
import ListaProyectos from '../components/ListaProyecto';
import { type FiltrosProyectos } from '../types/proyecto';
import { useProyectosMasGustados } from '../hooks/useProyectosMasGustados';

export default function ProyectosMasGustados() {
  const {
    navigate,
    loading,
    error,
    favoritos,
    filtros,
    setFiltros,
    toggleFavorito,
    handleEliminar,
    proyectosFiltrados
  } = useProyectosMasGustados();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      {/* ESTRUCTURA FLEXBOX PARA EMPUJAR EL FOOTER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow pt-24 pb-20">
            <header className="max-w-[1400px] mx-auto px-4 md:px-8 mt-24 mb-16 relative">
                {/* Elemento Decorativo */}
                <div className="absolute -top-10 -right-6 text-on-surface font-headline text-8xl md:text-9xl tracking-[1rem] opacity-[0.03] transform rotate-12 pointer-events-none uppercase">
                    HALL OF FAME
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start mb-6 gap-6 relative z-10 pt-12">
                    <div className="text-center md:text-left mt-4 md:mt-0">
                        <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">El Salón de la Fama</span>
                        <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tight text-on-surface block mb-2">
                            Proyectos <span className="text-outline-variant italic">Más Gustados</span>
                        </h1>
                    </div>
                </div>

                <div className="border-l-2 border-primary pl-4 mx-auto md:mx-0 relative z-10 mb-12">
                    <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-lg">
                        Aquí se inmortaliza lo mejor. Explora los tatuajes y plantillas con mayor valoración.
                    </p>
                </div>

                {/* PANEL DE FILTROS */}
                <div className="mt-8 glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-6 relative group z-10 max-w-4xl">
                    <div className="flex-grow md:w-1/2 relative space-y-3">
                        <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                            Ordenar Por
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-surface-container-highest border border-outline-variant/30 px-4 py-4 pr-10 focus:outline-none focus:border-primary transition-all font-label text-xs uppercase appearance-none cursor-pointer rounded-sm text-on-surface"
                                value={filtros.orden}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                            >
                                <option value="reciente">Nuevos Ganadores</option>
                                <option value="antiguo">Más antiguos</option>
                                <option value="valoracionAlta">De mayor a menor valoración</option>
                                <option value="valoracionBaja">De menor a mayor valoración</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>

                    <div className="flex-grow md:w-1/2 relative space-y-3">
                        <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                            Tipo de Proyecto
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-surface-container-highest border border-outline-variant/30 px-4 py-4 pr-10 focus:outline-none focus:border-primary transition-all font-label text-xs uppercase appearance-none cursor-pointer rounded-sm text-on-surface"
                                value={filtros.tipo}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
                            >
                                <option value="todos">Tatuajes y Plantillas</option>
                                <option value="tatuaje">Solo Tatuajes</option>
                                <option value="plantilla">Solo Plantillas</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
                {/* RENDERIZADO DEL COMPONENTE REUTILIZADO */}
                {loading && (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                        <p className="font-label text-xs tracking-widest text-primary uppercase">Abriendo el salón de la fama...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center py-20 bg-error-container/20 text-error border border-error/50 p-6 rounded-sm mb-12">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="font-body text-sm uppercase">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="relative">
                        <ListaProyectos
                        proyectos={proyectosFiltrados}
                        favoritos={favoritos}
                        onToggleFav={toggleFavorito}
                        puedeEditarFn={() => false}
                        navigate={navigate}
                        onEliminar={handleEliminar}
                        />
                    </div>
                )}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}