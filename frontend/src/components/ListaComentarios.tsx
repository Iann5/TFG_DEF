// src/components/ListaComentarios.tsx
import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { type ValoracionDetalle } from '../types/Valoracion';
import StarRating from './StarRating';
import api from '../services/api';

interface Props {
    valoraciones: ValoracionDetalle[];
    /** Segmento de API sin barra inicial, p. ej. `valoracion_proyectos` */
    valoracionApiSegment?: string;
    currentUserId?: number | null;
    onValoracionCambiada?: () => void;
}

export default function ListaComentarios({
    valoraciones,
    valoracionApiSegment,
    currentUserId,
    onValoracionCambiada,
}: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editEstrellas, setEditEstrellas] = useState(0);
    const [editComentario, setEditComentario] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const puedeGestionar =
        valoracionApiSegment != null &&
        currentUserId != null &&
        typeof onValoracionCambiada === 'function';

    const esPropia = (v: ValoracionDetalle) => {
        if (!puedeGestionar) return false;
        if (currentUserId != null) {
            return v.usuarioId != null && v.usuarioId === currentUserId;
        }
        const storedName = localStorage.getItem('userName');
        return !!(storedName && v.nombreUsuario === storedName);
    };

    const iniciarEdicion = (v: ValoracionDetalle) => {
        setEditingId(v.id);
        setEditEstrellas(v.estrellas);
        setEditComentario(v.comentario ?? '');
        setError(null);
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setError(null);
    };

    const guardarEdicion = async () => {
        if (editingId == null || !valoracionApiSegment) return;
        if (editEstrellas < 1 || editEstrellas > 5) {
            setError('Selecciona una puntuación entre 1 y 5.');
            return;
        }
        setGuardando(true);
        setError(null);
        try {
            await api.patch(
                `/${valoracionApiSegment}/${editingId}`,
                { estrellas: editEstrellas, comentario: editComentario },
                { headers: { 'Content-Type': 'application/merge-patch+json' } }
            );
            setEditingId(null);
            onValoracionCambiada?.();
        } catch {
            setError('No se pudo guardar. Inténtalo de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (id: number) => {
        if (!valoracionApiSegment || !window.confirm('¿Eliminar tu valoración y comentario? Esta acción no se puede deshacer.')) {
            return;
        }
        setEliminandoId(id);
        setError(null);
        try {
            await api.delete(`/${valoracionApiSegment}/${id}`);
            onValoracionCambiada?.();
        } catch {
            setError('No se pudo eliminar. Inténtalo de nuevo.');
        } finally {
            setEliminandoId(null);
        }
    };

    if (valoraciones.length === 0) {
        return (
            <p className="text-white/40 text-center py-8 italic">
                Sé el primero en dejar un comentario.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <p className="text-red-400 text-sm text-center" role="alert">
                    {error}
                </p>
            )}
            {valoraciones.map(v => {
                const propia = esPropia(v);
                const editando = editingId === v.id;

                return (
                    <div
                        key={v.id}
                        className="bg-[#1C1B28] border border-white/5 rounded-xl p-4 flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-700 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden border border-white/10">
                                {v.fotoPerfil ? (
                                    <img
                                        src={v.fotoPerfil}
                                        alt={v.nombreUsuario || 'Usuario'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    v.nombreUsuario?.charAt(0).toUpperCase() ?? '?'
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-white font-semibold text-sm leading-tight">
                                    {v.nombreUsuario ?? 'Usuario'}
                                </span>
                                <span className="text-white/30 text-xs">
                                    {new Date(v.fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                                {!editando && <StarRating value={v.estrellas} size={14} />}
                                {propia && !editando && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => iniciarEdicion(v)}
                                            className="p-1.5 rounded-lg text-white/50 hover:text-sky-400 hover:bg-white/5 transition"
                                            title="Editar mi valoración"
                                        >
                                            <Pencil size={16} strokeWidth={2} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => eliminar(v.id)}
                                            disabled={eliminandoId === v.id}
                                            className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 transition disabled:opacity-40"
                                            title="Eliminar mi valoración"
                                        >
                                            <Trash2 size={16} strokeWidth={2} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {editando ? (
                            <div className="pl-0 sm:pl-12 flex flex-col gap-3 pt-2 border-t border-white/5 mt-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-white/60 text-sm">Puntuación:</span>
                                    <StarRating value={editEstrellas} onChange={setEditEstrellas} size={24} />
                                    {editEstrellas > 0 && (
                                        <span className="text-yellow-400 font-bold text-sm">
                                            {editEstrellas}/5
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    value={editComentario}
                                    onChange={e => setEditComentario(e.target.value)}
                                    placeholder="Comentario (opcional)..."
                                    rows={3}
                                    className="w-full bg-[#1C1B28] text-white border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-sky-500 resize-none placeholder:text-white/30"
                                />
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={cancelarEdicion}
                                        disabled={guardando}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white/70 border border-white/10 hover:bg-white/5"
                                    >
                                        <X size={16} /> Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={guardarEdicion}
                                        disabled={guardando}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold disabled:opacity-50"
                                    >
                                        <Check size={16} /> {guardando ? 'Guardando…' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            v.comentario && (
                                <p className="text-white/70 text-sm leading-relaxed pl-12">
                                    {v.comentario}
                                </p>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}
