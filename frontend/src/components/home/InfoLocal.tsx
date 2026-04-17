import { useNavigate } from "react-router-dom";

export default function SeccionInfoLocal() {
  const navigate = useNavigate();

  return (
    <>
      <section className="mb-24 mt-24">
        {/* Banner Mapa / Imagen Estudio */}
        <div className="w-full h-48 md:h-64 relative overflow-hidden bg-surface-container border-y border-outline-variant/30 mb-12">
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10 pointer-events-none"></div>
            <iframe 
               src="https://maps.google.com/maps?q=Hall%20Of%20Ink,%20C.%20S%C3%B3crates,%2014,%20Granada&t=&z=16&ie=UTF8&iwloc=&output=embed" 
               width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" 
               className="absolute inset-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 z-0"
            ></iframe>
        </div>

        {/* Contenido Información */}
        <div id="info-local" className="scroll-mt-24 max-w-5xl mx-auto flex flex-col md:flex-row gap-16 px-4">
            
            {/* Main Info */}
            <div className="md:w-2/3">
                <div className="inline-flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-secondary text-sm">info</span>
                    <span className="font-label text-xs tracking-[0.2em] text-secondary font-bold uppercase">Información del Local</span>
                </div>
                
                <h3 className="font-headline text-4xl md:text-5xl font-black mb-8 text-on-surface uppercase tracking-tight">
                    Tattoo Paradise <span className="text-outline/40">Studio</span>
                </h3>
                
                <p className="text-on-surface-variant body-lg leading-relaxed mb-12 max-w-2xl text-justify">
                    Fundado con la pasión de transformar el arte corporal, Tattoo Paradise nació en el corazón de Granada. Lo que empezó como un pequeño taller de artistas independientes, se ha convertido hoy en un estudio de referencia. Nuestro objetivo es trasladar tus ideas a la piel con el más alto nivel de detalle, en un ambiente donde la creatividad, la higiene y la profesionalidad se unen.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-sm">
                    <div>
                        <h4 className="font-label tracking-widest text-[#8c909f] text-[10px] uppercase mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            Dirección
                        </h4>
                        <p className="font-headline font-bold text-on-surface">Calle Sócrates, 14, Ronda</p>
                        <p className="text-on-surface-variant text-sm mt-1">18002 Granada, España</p>
                    </div>
                    <div>
                        <h4 className="font-label tracking-widest text-[#8c909f] text-[10px] uppercase mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">mail</span>
                            Contacto
                        </h4>
                        <p className="font-headline font-bold text-on-surface">+34 600 000 000</p>
                        <p className="text-on-surface-variant text-sm mt-1 cursor-pointer hover:text-primary transition-colors">info@tattooparadise.com</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Enlaces */}
            <div className="md:w-1/3 flex flex-col justify-between">
                <div>
                    <h4 className="font-label text-xs uppercase tracking-widest text-outline border-b border-outline-variant/30 pb-4 mb-6">
                        Enlaces de Interés
                    </h4>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <button onClick={() => navigate('/privacidad')} className="text-on-surface-variant hover:text-primary transition-colors font-headline text-sm uppercase tracking-wide flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-xs opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">chevron_right</span>
                                Políticas de Privacidad
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigate('/reembolso')} className="text-on-surface-variant hover:text-primary transition-colors font-headline text-sm uppercase tracking-wide flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-xs opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">chevron_right</span>
                                Reembolso
                            </button>
                        </li>
                    </ul>
                </div>
                
                <button onClick={() => navigate('/equipo')} className="primary-gradient-cta text-[#00285d] font-bold mt-12 py-4 px-6 rounded-sm font-label tracking-widest uppercase flex justify-between items-center group shadow-[0_5px_20px_rgba(173,198,255,0.15)] hover:shadow-[0_5px_30px_rgba(173,198,255,0.3)] transition-all">
                    <span>Ver Equipo</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
        </div>
      </section>
    </>
  );
}