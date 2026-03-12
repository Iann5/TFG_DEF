import { useState, useEffect } from 'react';
import type { Cita } from '../../types/perfil';
import api from '../../services/api';

interface Props {
    userId: number | null;
}

export default function PanelUsuario({ userId }: Props) {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchCitas = async () => {
            try {
                // GET /citas filtrando por el usuario actual
                const res = await api.get(`/citas?usuario=${userId}`);
                // API Platform returns collections usually inside `hydra:member` or just array if using custom normalizer.
                const data = res.data['hydra:member'] || res.data;
                setCitas(data);
            } catch (error) {
                console.error("Error al cargar citas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCitas();
    }, [userId]);

    const handleCancelar = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres cancelar esta cita?")) return;

        try {
            await api.delete(`/citas/${id}`);
            setCitas(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error al cancelar la cita:", error);
            alert("No se pudo cancelar la cita.");
        }
    };

    const formatFecha = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatHora = (isoString: string) => {
        if (!isoString) return '';
        if (isoString.includes('T')) {
            return isoString.split('T')[1].substring(0, 5);
        }
        return '';
    };

    if (loading) {
        return <div className="text-white/60 text-sm">Cargando citas...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-1">Tus Citas</h2>
            <hr className="border-white/40 mb-4" />

            {citas.length === 0 && (
                <p className="text-white/60 text-sm bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    No tienes citas pendientes. ¡Anímate a reservar una!
                </p>
            )}

            <div className="space-y-4">
                {citas.map(cita => (
                    <div
                        key={cita.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-600/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 gap-4"
                    >
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">
                                {formatFecha(cita.fecha)} a las {formatHora(cita.hora_inicio)}
                            </span>
                            <span className="text-white/70 text-sm">
                                Artista: {cita.trabajador?.usuario?.nombre ? `${cita.trabajador.usuario.nombre} ${cita.trabajador.usuario.apellidos || ''}` : 'Artista'}
                            </span>
                            <span className="text-sky-300 text-xs font-bold uppercase mt-1">
                                {cita.tipo_cita} - {cita.estado}
                            </span>
                        </div>

                        <button
                            onClick={() => handleCancelar(cita.id)}
                            className="bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 font-bold px-4 py-2 rounded-lg transition shrink-0 self-start sm:self-center"
                        >
                            Cancelar Cita
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
