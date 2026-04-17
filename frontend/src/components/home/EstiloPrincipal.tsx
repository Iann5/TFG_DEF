import { useNavigate } from "react-router-dom";
import { type EstiloData } from "../../types/EstiloInterface";
import Placeholder from "./Placeholder";

export default function EstiloPrincipal({ estilo }: { estilo: EstiloData | null }) {
  const navigate = useNavigate();

  return (
    <section className="mb-24 mt-12">
        <div className="relative overflow-hidden rounded-lg bg-surface-container-low border-l-4 border-primary shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 halftone-bg text-primary pointer-events-none"></div>
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 relative z-10">
                <div className="w-full md:w-1/3">
                    <div className="inline-flex items-center gap-2 border border-primary/40 px-3 py-1 rounded-full mb-6 bg-primary/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-label text-[10px] tracking-[0.2em] text-primary font-bold uppercase">NUESTRO ESTILO PRINCIPAL</span>
                    </div>
                    <h2 className="ink-brush text-5xl md:text-6xl text-on-surface mb-6 uppercase flex items-center gap-3">
                        {estilo ? estilo.nombre : 'INFO'}
                    </h2>
                    <p className="text-on-surface-variant leading-relaxed body-lg mb-8 max-w-md">
                        En Tattoo Paradise nos enorgullece presentar nuestra especialidad más destacada. Hemos dedicado años de práctica para ofrecerte piezas del más alto nivel, cuidando cada detalle.
                    </p>
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                            <span className="font-label text-xs uppercase tracking-widest">Trazo de precisión digital</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                            <span className="font-label text-xs uppercase tracking-widest">Sombreado Halftone exclusivo</span>
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => {
                    const imgSrc = estilo?.imagenes?.[i] || (i === 0 ? estilo?.imagen : null);
                    return imgSrc ? (
                        <div key={i} className={`aspect-[3/4] rounded-sm overflow-hidden border border-secondary/20 shadow-[0_0_15px_rgba(123,209,250,0.1)] group cursor-pointer ${i === 1 ? 'md:mt-8' : ''}`} onClick={() => navigate('/estilos')}>
                            <img src={imgSrc} alt={`Foto ${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                        </div>
                    ) : <Placeholder key={i} className={`aspect-[3/4] bg-surface-container ${i === 1 ? 'md:mt-8' : ''}`} texto="FOTO" />;
                    })}
                </div>
            </div>
        </div>
    </section>
  );
}