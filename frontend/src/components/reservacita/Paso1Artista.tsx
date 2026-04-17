
import type { Trabajador } from '../../types/Citas';

interface Props {
    trabajadores: Trabajador[];
    onSelect: (id: number) => void;
}

export default function Paso1Artista({ trabajadores, onSelect }: Props) {
    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl md:text-2xl text-on-surface font-headline uppercase tracking-tight mb-8 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">group</span>
                1. Elige a tu artista
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trabajadores.map(trab => (
                    <div
                        key={trab.id}
                        onClick={() => onSelect(trab.id)}
                        className="glass-panel p-6 flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 group"
                    >
                        <div className="w-24 h-24 bg-surface-container/50 border border-outline-variant/30 overflow-hidden mb-6 p-1 relative rounded-full">
                            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                            {trab.foto_perfil ? (
                                <img src={trab.foto_perfil} alt={trab.nombre} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-105 group-hover:scale-100 rounded-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-headline text-on-surface/30 uppercase rounded-full">
                                    {trab.nombre.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className="text-on-surface font-headline text-lg tracking-wide uppercase text-center leading-none group-hover:text-primary transition-colors">
                            {trab.nombre} {trab.apellidos}
                        </h3>
                        <p className="text-primary border border-primary/20 bg-primary/10 font-label text-[10px] uppercase tracking-[0.2em] mt-4 px-3 py-1 opacity-0 group-hover:opacity-100 transition-all rounded-sm">
                            Seleccionar
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
