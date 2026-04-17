import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEstilosInicio } from "../hooks/useEstilosInicio";
import EstiloPrincipal from "../components/home/EstiloPrincipal";
import SeccionInfoLocal from "../components/home/InfoLocal";
import Placeholder from "../components/home/Placeholder";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const { estiloPrincipal, estilosSolicitados, loading } = useEstilosInicio();

  return (
    <div className="min-h-[100dvh] relative bg-background font-body text-on-background overflow-hidden flex flex-col pt-20">
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-grow max-w-7xl relative">
            
            {/* Título Hero */}
            <section className="mb-20 text-center relative z-20">
                <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter uppercase mb-4 leading-none text-on-background">
                    Nuestros Estilos <br/> <span className="text-primary italic">de Tatuaje</span>
                </h1>
                
                {/* Opcional: Subtítulo Hero */}
                <p className="text-on-surface-variant body-lg mb-8 max-w-xl mx-auto">
                    Explora nuestra galería de proyectos. Desde la precisión del trazo digital hasta el realismo más inmersivo.
                </p>
            </section>

            {loading ? (
                <div className="text-center py-20 font-headline text-3xl tracking-[0.2em] uppercase text-primary animate-pulse">
                    <span className="material-symbols-outlined align-middle mr-2 animate-spin">refresh</span> 
                    Sincronizando Archivos...
                </div>
            ) : (
                <div className="relative z-20">
                    {/* Componente Estilo Principal refactorizado */}
                    <EstiloPrincipal estilo={estiloPrincipal} />

                    {/* SECCIÓN ESTILOS SOLICITADOS (Grid Cyber-Manga) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 mb-24">
                        {estilosSolicitados.slice(0, 3).map((est, index) => {
                            if (!est) return <Placeholder key={`ph-${index}`} className="aspect-square bg-surface-container-low" texto="PRÓXIMAMENTE" />;
                            
                            // Efecto hover diferente para el del medio para darle asimetría
                            const isMiddle = index === 1;
                            const cardClasses = isMiddle 
                                ? "bg-surface-container-low group cursor-pointer border border-secondary/40 shadow-[0_0_30px_rgba(123,209,250,0.15)] ring-1 ring-secondary/20 relative"
                                : "bg-surface-container-low group cursor-pointer border border-transparent hover:border-secondary/20 transition-all duration-500 relative";

                            return (
                                <div key={est.id} onClick={() => navigate('/estilos')} className={cardClasses}>
                                    <div className="aspect-square overflow-hidden relative">
                                        {isMiddle && <div className="absolute inset-0 bg-secondary/10 mix-blend-overlay z-10 pointer-events-none"></div>}
                                        <img 
                                            src={est.imagen} 
                                            alt={est.nombre} 
                                            className={`w-full h-full object-cover transition-all duration-700 ${isMiddle ? 'scale-100' : 'opacity-80 group-hover:opacity-100'}`} 
                                        />
                                        {isMiddle && (
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <span className="bg-secondary text-on-secondary px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] font-label">Tendencia</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className={`font-headline text-2xl font-bold tracking-tight mb-2 uppercase ${isMiddle ? 'text-secondary' : 'text-on-surface'}`}>
                                            {est.nombre}
                                        </h3>
                                        <p className="text-on-surface-variant text-sm body-lg line-clamp-2 mb-6">
                                            Descubre más sobre este estilo accediendo a la galería completa de proyectos.
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className={`font-label text-[10px] tracking-widest uppercase ${isMiddle ? 'text-secondary' : 'text-outline'}`}>
                                                Explorar
                                            </span>
                                            <span className={`material-symbols-outlined transition-all ${isMiddle ? 'text-secondary' : 'text-secondary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0'}`}>
                                                arrow_right_alt
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    <SeccionInfoLocal />
                </div>
            )}
        </main>
        <Footer />
      </div>
    </div>
  );
}