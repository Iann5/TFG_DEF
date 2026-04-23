import { Tag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import { useDetalleProyecto } from '../hooks/useDetalleProyecto';

export default function DetalleProyecto() {
    const {
        id,
        navigate,
        isLoggedIn,
        isTrabajadorOrAdmin,
        proyecto,
        valoraciones,
        loading,
        currentUserId,
        recargarValoraciones,
        titulo,
        imagen,
        tipo,
        artista,
        descripcion,
        precioOriginal,
        precioOferta,
        media,
        yaValoró
    } = useDetalleProyecto();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
               <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">refresh</span>
               <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando proyecto...</p>
            </div>
        );
    }

    if (!proyecto) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
                <span className="material-symbols-outlined text-error text-6xl">error</span>
                <p className="font-headline text-2xl uppercase tracking-widest text-on-surface">Proyecto no encontrado</p>
                <button onClick={() => navigate('/proyecto')} className="bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all duration-300">
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1400px] w-full mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-8 transition-colors group w-fit"
                    >
                        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Volver
                    </button>

                    <div className="glass-panel overflow-hidden mb-16 flex flex-col lg:flex-row relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                        {/* Imagen */}
                        <div className="lg:w-1/2 bg-surface-container-highest border-b lg:border-b-0 lg:border-r border-outline-variant/30 flex items-center justify-center p-8 min-h-[400px] lg:min-h-[600px] relative">
                            <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none mix-blend-overlay"></div>
                            {imagen ? (
                                <img src={imagen} alt={titulo} className="w-full h-full object-contain filter grayscale hover:filter-none transition-all duration-700 hover:scale-105 relative z-10" />
                            ) : (
                                <div className="text-outline-variant border border-outline-variant/20 bg-surface-container p-16 flex flex-col items-center justify-center relative">
                                   <div className="absolute inset-0 bg-halftone opacity-30"></div>
                                   <span className="material-symbols-outlined text-4xl relative z-10">image</span>
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col relative z-20">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                <div className="flex-1">
                                    <div className="font-label text-primary text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                       <span className="w-4 h-[1px] bg-primary"></span>
                                       Galería Oficial
                                    </div>
                                    <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-wide leading-none">{titulo}</h1>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 border border-outline-variant/30 rounded-sm">
                                        <StarRating value={media} size={16} />
                                        <span className="text-primary font-label font-bold text-sm tracking-widest leading-none mt-0.5">
                                            {media > 0 ? media.toFixed(1) : 'NEW'}
                                        </span>
                                    </div>
                                    <span className="text-outline font-body text-[10px] tracking-wider uppercase">({valoraciones.length} Reseñas)</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-8">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 font-label text-[10px] uppercase tracking-widest rounded-sm">
                                    <Tag size={12} strokeWidth={2} /> {tipo}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/30 font-label text-[10px] uppercase tracking-widest rounded-sm">
                                    <User size={12} strokeWidth={2} /> {artista}
                                </span>
                            </div>

                            {descripcion.trim().length > 0 && (
                                <div className="mb-10 relative">
                                    <div className="absolute left-0 top-0 w-1 h-full bg-primary/30 rounded-full"></div>
                                    <div className="pl-6">
                                        <p className="font-body text-on-surface-variant leading-relaxed text-sm lg:text-base whitespace-pre-line">
                                            {descripcion}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-6 border-t border-outline-variant/20">
                                <div className="mb-8">
                                    <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} size="lg" />
                                </div>

                                {/* Botón Reservar cita */}
                                {!isTrabajadorOrAdmin && (
                                    isLoggedIn ? (
                                        <button
                                            onClick={() => navigate('/cita', {
                                                state: {
                                                    trabajadorId: proyecto.autor?.id,
                                                    proyectoId: proyecto.id
                                                }
                                            })}
                                            className="w-full primary-gradient-cta"
                                        >
                                            <div className="cta-content">
                                               <span>Reservar Cita Ahora</span>
                                               <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col items-center gap-4 rounded-sm">
                                            <p className="text-on-surface-variant font-body text-sm text-center">Para reservar una cita necesitas iniciar sesión primero.</p>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="w-full bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-3 rounded-sm transition-all duration-300"
                                            >
                                                Iniciar Sesión
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/20 pb-6">
                           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary">reviews</span>
                           </div>
                           <div>
                              <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-widest text-on-surface">Valoraciones del Proyecto</h2>
                              <p className="font-label text-[10px] text-outline tracking-[0.2em] uppercase">Opiniones y Preguntas Frecuentes</p>
                           </div>
                        </div>
                        <SeccionValoraciones
                            isLoggedIn={isLoggedIn}
                            yaValoró={yaValoró}
                            valoraciones={valoraciones}
                            onValoracionEnviada={recargarValoraciones}
                            proyectoId={Number(id)}
                            nombreRecurso="proyecto"
                            valoracionApiSegment="valoracion_proyectos"
                            currentUserId={currentUserId}
                        />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
