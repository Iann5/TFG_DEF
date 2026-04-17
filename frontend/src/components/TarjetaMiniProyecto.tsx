// src/components/TarjetaMiniProyecto.tsx
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export interface ProyectoMini {
    id: number;
    nombre?: string;
    tipo?: string;
    imagen?: string;
    fecha_subida?: string;
    precio_original?: number;
    valoracionProyectos?: { estrellas: number }[];
}

export function mediaProyecto(p: ProyectoMini): number {
    const vals = p.valoracionProyectos ?? [];
    if (!vals.length) return 0;
    return vals.reduce((a, v) => a + v.estrellas, 0) / vals.length;
}

interface Props {
    proyecto: ProyectoMini;
}

export default function TarjetaMiniProyecto({ proyecto }: Props) {
    const navigate = useNavigate();
    const media = mediaProyecto(proyecto);

    return (
        <div
            onClick={() => navigate(`/proyecto/${proyecto.id}`)}
            className="glass-panel flex flex-col cursor-pointer hover:-translate-y-1 transition-all overflow-hidden border border-outline-variant/30 group"
        >
            <div className="aspect-square bg-surface-container border-b border-outline-variant/20 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
                {proyecto.imagen
                    ? (
                        <img
                            src={proyecto.imagen}
                            alt={proyecto.nombre}
                            className="w-full h-full object-cover filter grayscale group-hover:filter-none transition-all duration-700 hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant font-headline text-4xl tracking-widest opacity-30">
                            IMG
                        </div>
                    )
                }
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <p className="text-on-surface font-headline text-lg uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {proyecto.nombre ?? 'SIN TÍTULO'}
                </p>
                <div className="flex items-center justify-between gap-2">
                    <span className="bg-primary/10 text-primary font-label text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/20 rounded-sm truncate">
                        {proyecto.tipo ?? '—'}
                    </span>
                    <div className="flex items-center gap-2 border border-outline-variant/30 px-2 py-1 rounded-sm bg-surface-container/30">
                        <Star size={14} strokeWidth={3} className="fill-tertiary text-tertiary" />
                        <span className="text-on-surface font-label text-[10px] tracking-widest uppercase">
                            {media > 0 ? media.toFixed(1) : '—'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
