export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 py-12 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center font-label text-xs tracking-widest text-on-surface-variant uppercase gap-8 md:gap-0">
        
        <div className="flex gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">share</span>
                REDES
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                ESTUDIO
            </span>
        </div>

        <div className="text-xl font-headline font-black tracking-widest text-on-surface hover:text-primary transition-colors cursor-pointer text-center md:text-left">
          TATTOO<span className="text-primary italic ml-1">PARADISE</span>
        </div>
        
        <div className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">copyright</span>
            DERECHOS DE AUTOR 2026
        </div>

      </div>
    </footer>
  );
}