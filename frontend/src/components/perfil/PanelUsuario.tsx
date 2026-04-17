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
                const data = res.data['hydra:member'] || res.data;
                
                // Filtrar citas que ya han pasado
                const hoyStr = new Date().toISOString().split('T')[0];
                const citasFuturas = data.filter((cita: Cita) => {
                    const citaFechaStr = cita.fecha.split('T')[0];
                    return citaFechaStr >= hoyStr;
                });
                
                setCitas(citasFuturas);
            } catch (error) {
                console.error("Error al cargar citas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCitas();
    }, [userId]);

    const handleCancelar = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres cancelar esta cita? El artista será notificado.")) return;

        try {
            await api.patch(`/citas/${id}`, { estado: 'Cancelada' }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
            setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'Cancelada' } : c));
        } catch (error) {
            console.error("Error al cancelar la cita:", error);
            alert("No se pudo cancelar la cita.");
        }
    };

    const handleBorrar = async (id: number) => {
        if (!window.confirm("Esta acción borrará el registro de tu perfil permanentemente. ¿Continuar?")) return;

        try {
            await api.delete(`/citas/${id}`);
            setCitas(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error al borrar el registro:", error);
            alert("No se pudo borrar el registro de la cita.");
        }
    };

    const formatFecha = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatHora = (isoString: string) => {
        if (!isoString) return '';
        if (isoString.includes('T')) {
            return isoString.split('T')[1].substring(0, 5);
        }
        return '';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <span className="font-label text-xs uppercase tracking-widest text-outline">Cargando Citas...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 h-full">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                Tus Citas
            </h2>
            <div className="w-full h-px bg-outline-variant/30 mb-2"></div>

            {citas.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 bg-surface-container-highest/30 rounded-sm border border-outline-variant/20 border-dashed text-center">
                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-3">event_busy</span>
                    <p className="text-on-surface-variant font-body text-sm">
                        No tienes ninguna cita programada.
                    </p>
                    <p className="text-[#8c909f] font-label text-[10px] uppercase tracking-widest mt-2">
                        ¡Reserva con uno de nuestros artistas!
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {citas.map(cita => (
                    <div
                        key={cita.id}
                        className="flex flex-col bg-surface-container-highest/50 rounded-sm border border-outline-variant/20 overflow-hidden group"
                    >
                        {/* Cabecera Tarjeta Cita */}
                        <div className="bg-surface-container-highest p-4 flex justify-between items-center border-b border-outline-variant/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-surface-container p-2 rounded-sm border border-outline-variant/20 flex flex-col items-center justify-center min-w-[50px]">
                                    <span className="font-headline font-black text-on-surface text-lg leading-none">{formatFecha(cita.fecha).split(' ')[0]}</span>
                                    <span className="font-label text-[10px] uppercase tracking-widest text-primary">{formatFecha(cita.fecha).split(' ')[1]}</span>
                                </div>
                                <div>
                                    <span className="font-headline font-bold text-on-surface text-lg block">{formatHora(cita.hora_inicio)}</span>
                                    <span className="font-label text-[10px] uppercase tracking-widest text-[#8c909f]">
                                        {cita.tipo_cita}
                                    </span>
                                </div>
                            </div>
                            
                            <span className={`px-3 py-1 rounded-sm text-[10px] font-label uppercase tracking-widest font-bold border flex items-center gap-1
                                ${cita.estado === 'Confirmada' ? 'bg-primary/10 text-primary border-primary/30' :
                                    cita.estado === 'Cancelada' || cita.estado === 'Rechazada' ? 'bg-error-container/50 text-error border-error/50' :
                                        'bg-[#d2a33f]/10 text-[#d2a33f] border-[#d2a33f]/30'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[12px]">
                                    {cita.estado === 'Confirmada' ? 'check_circle' : 
                                     cita.estado === 'Cancelada' || cita.estado === 'Rechazada' ? 'cancel' : 'pending_actions'}
                                </span>
                                {cita.estado}
                            </span>
                        </div>

                        {/* Cuerpo Tarjeta Cita */}
                        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <p className="font-body text-sm text-on-surface-variant flex items-center gap-1.5 mb-2">
                                    <span className="material-symbols-outlined text-[16px] text-outline">brush</span>
                                    Artista: <strong className="text-on-surface">{cita.trabajador?.usuario?.nombre ? `${cita.trabajador.usuario.nombre} ${cita.trabajador.usuario.apellidos || ''}` : 'Sin asignar'}</strong>
                                </p>
                                
                                {/* PROYECTOS Y PACKS ELEGIDOS */}
                                {((cita.proyectos?.length ?? 0) > 0 || (cita.packs?.length ?? 0) > 0) && (
                                    <div className="mt-3 bg-surface-container rounded-sm border border-outline-variant/10 p-3 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none"></div>
                                        <span className="text-[#8c909f] text-[10px] uppercase tracking-[0.2em] font-label mb-2 block relative z-10">Diseños Elegidos:</span>
                                        <div className="flex flex-wrap gap-2 relative z-10">
                                            {cita.proyectos?.map(p => (
                                                <div key={`p-${p.id}`} className="bg-primary hover:bg-primary/90 text-[#00285d] font-label text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm transition-colors border border-primary/50 shadow-[0_2px_10px_rgba(173,198,255,0.1)]">
                                                    {p.nombre || 'Proyecto'}
                                                </div>
                                            ))}
                                            {cita.packs?.map(pk => (
                                                <div key={`pk-${pk.id}`} className="bg-surface-container-highest border-border border text-on-surface font-label text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                                                    {pk.titulo || 'Pack'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="w-full sm:w-auto flex justify-end shrink-0 mt-2 sm:mt-0">
                                {cita.estado !== 'Cancelada' && cita.estado !== 'Rechazada' ? (
                                    <button
                                        onClick={() => handleCancelar(cita.id)}
                                        className="w-full sm:w-auto bg-error-container/20 hover:bg-error-container text-error border border-error/50 hover:border-error text-[10px] font-label uppercase tracking-[0.2em] px-4 py-2 rounded-sm transition-all flex items-center justify-center gap-1 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">event_busy</span>
                                        Cancelar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBorrar(cita.id)}
                                        className="w-full sm:w-auto bg-surface-container hover:bg-surface-container-low border border-outline-variant/30 hover:border-on-surface text-on-surface-variant hover:text-on-surface text-[10px] font-label uppercase tracking-[0.2em] px-4 py-2 rounded-sm transition-all flex items-center justify-center gap-1 shrink-0 group"
                                    >
                                        <span className="material-symbols-outlined text-[14px] group-hover:text-error transition-colors">delete</span>
                                        Borrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
