import { type ChangeEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// IMPORTAMOS LOS COMPONENTES Y TIPOS REUTILIZABLES (Cero duplicidades, cero 'any')
import ListaProyectos from '../components/ListaProyecto';
import { type FiltrosProyectos } from '../types/proyecto';
import { usePlantillasDemandadas } from '../hooks/usePlantillasDemandadas';

export default function PlantillasDemandadas() {
    const {
        navigate,
        loading,
        error,
        favoritos,
        filtros,
        setFiltros,
        toggleFavorito,
        handleEliminar,
        plantillasFiltradas,
        mensuales,
        anuales
    } = usePlantillasDemandadas();

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="flex-grow pt-24 pb-20">
                    <header className="max-w-[1400px] mx-auto px-4 md:px-8 mt-24 mb-16 relative">
                        {/* Elemento Decorativo */}
                        <div className="absolute -top-10 -left-6 text-on-surface font-headline text-8xl md:text-9xl tracking-[1rem] opacity-[0.03] transform -rotate-12 pointer-events-none uppercase">
                            FLASHES
                        </div>

                        <div className="relative">
                            <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4 pt-12">Catálogo de Flashes</span>
                            <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tight text-on-surface mb-2 relative z-10 block">
                                Plantillas <span className="text-outline-variant italic">Demandadas</span>
                            </h1>
                            {/* Decorative elements */}
                            <div className="absolute -left-4 top-12 w-1 h-32 bg-primary"></div>
                        </div>

                        {/* BARRA DE FILTROS */}
                        <div className="mt-16 glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-6 relative group z-10">
                            <div className="relative flex-grow">
                                <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                                    Buscar Plantilla
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Nombre o estilo..."
                                        className="w-full bg-surface-container-highest border border-outline-variant/30 px-12 py-4 focus:outline-none focus:border-primary transition-all font-body placeholder-outline/50 text-sm rounded-sm"
                                        value={filtros.busqueda}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, busqueda: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-grow md:max-w-xs relative">
                                <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                                    Ordenar Por
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-surface-container-highest border border-outline-variant/30 px-4 py-4 pr-10 focus:outline-none focus:border-primary transition-all font-label text-xs uppercase appearance-none cursor-pointer rounded-sm text-on-surface"
                                        value={filtros.orden}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                                    >
                                        <option value="reciente">Novedades</option>
                                        <option value="antiguo">Más antiguos</option>
                                        <option value="valoracionAlta">Mejor valorados</option>
                                        <option value="valoracionBaja">Peor valorados</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
                        {loading && (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                                <p className="font-label text-xs tracking-widest text-primary uppercase">Buscando en los archivos...</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center py-20 bg-error-container/20 text-error border border-error/50 p-6 rounded-sm mb-12">
                                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                                <p className="font-body text-sm uppercase">{error}</p>
                            </div>
                        )}

                        {/* NOVEDADES MENSUALES */}
                        {!loading && mensuales.length > 0 && (
                            <section className="mb-24 relative">
                                <h2 className="text-3xl md:text-4xl font-headline text-on-surface uppercase tracking-wide mb-12 border-b border-outline-variant/30 pb-4 flex items-center gap-4">
                                    Tendencias del Mes
                                    <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
                                </h2>
                                <ListaProyectos
                                    proyectos={mensuales}
                                    favoritos={favoritos}
                                    onToggleFav={toggleFavorito}
                                    puedeEditarFn={() => false}
                                    navigate={navigate}
                                    onEliminar={handleEliminar}
                                />
                            </section>
                        )}

                        {/* POPULARES ANUALES */}
                        {!loading && anuales.length > 0 && (
                            <section className="relative">
                                <h2 className="text-2xl md:text-3xl font-headline text-outline-variant uppercase tracking-wide mb-12 border-b border-outline-variant/30 pb-4 flex items-center gap-4">
                                    Catálogo Histórico
                                    <span className="material-symbols-outlined text-xl">history</span>
                                </h2>
                                <div className="opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-500">
                                    <ListaProyectos
                                        proyectos={anuales}
                                        favoritos={favoritos}
                                        onToggleFav={toggleFavorito}
                                        puedeEditarFn={() => false}
                                        navigate={navigate}
                                        onEliminar={handleEliminar}
                                    />
                                </div>
                            </section>
                        )}

                        {!loading && plantillasFiltradas.length === 0 && (
                            <div className="text-outline-variant font-label text-xs uppercase tracking-widest text-center py-10">No se encontraron plantillas con esos filtros.</div>
                        )}
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    );
}