// src/components/ListaComentarios.tsx
import { type ValoracionDetalle } from '../types/proyecto';
import StarRating from './StarRating';

interface Props {
    valoraciones: ValoracionDetalle[];
}

export default function ListaComentarios({ valoraciones }: Props) {
    if (valoraciones.length === 0) {
        return (
            <p className="text-white/40 text-center py-8 italic">
                Sé el primero en dejar un comentario.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {valoraciones.map(v => (
                <div
                    key={v.id}
                    className="bg-[#1C1B28] border border-white/5 rounded-xl p-4 flex flex-col gap-2"
                >
                    <div className="flex items-center gap-3">
                        {/* Avatar inicial */}
                        <div className="w-9 h-9 rounded-full bg-sky-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {v.nombreUsuario?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm leading-tight">
                                {v.nombreUsuario ?? 'Usuario'}
                            </span>
                            <span className="text-white/30 text-xs">
                                {new Date(v.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="ml-auto">
                            <StarRating value={v.estrellas} size={14} />
                        </div>
                    </div>
                    {v.comentario && (
                        <p className="text-white/70 text-sm leading-relaxed pl-12">
                            {v.comentario}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
