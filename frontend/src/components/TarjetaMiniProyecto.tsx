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
            className="bg-[#1C1B28] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-sky-500/40 transition group"
        >
            <div className="aspect-square bg-[#9CA3AF] overflow-hidden">
                {proyecto.imagen
                    ? <img src={proyecto.imagen} alt={proyecto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-3xl">IMG</div>
                }
            </div>
            <div className="p-3">
                <p className="text-white text-sm font-semibold truncate">{proyecto.nombre ?? 'Sin título'}</p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-white/40 text-xs uppercase tracking-wider">{proyecto.tipo ?? '—'}</span>
                    <div className="flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">{media > 0 ? media.toFixed(1) : '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
