import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Cita } from '../types/perfil';

export default function VistaDia() {
    const { fecha } = useParams<{ fecha: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();

    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para la edición de citas
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<{ fecha: string; horaInicio: string; horaFin: string; estado: string }>({
        fecha: '',
        horaInicio: '',
        horaFin: '',
        estado: ''
    });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        if (!hasRole('ROLE_TRABAJADOR') && !hasRole('ROLE_ADMIN')) {
            navigate('/perfil');
            return;
        }

        const fetchCitasDelDia = async () => {
            try {
                // Primero obtenemos el ID del trabajador del usuario actual
                const meRes = await api.get('/me');
                const trabajadorId = meRes.data.trabajadorId;

                if (!trabajadorId) {
                    setError('No tienes perfil de trabajador asociado.');
                    return;
                }

                // Obtener las citas de ese día para este trabajador (la fecha viaja como parametro exacto)
                const citasRes = await api.get<Cita[]>(`/citas?trabajador=${trabajadorId}&fecha=${fecha}`);

                // Ordenar por hora de inicio (ascendente)
                const ordenadas = citasRes.data.sort((a, b) => {
                    const horaA = new Date(a.hora_inicio).getTime();
                    const horaB = new Date(b.hora_inicio).getTime();
                    return horaA - horaB;
                });

                setCitas(ordenadas);
            } catch (err) {
                console.error("Error obteniendo la agenda del día:", err);
                setError('Hubo un error al cargar las citas del día.');
            } finally {
                setLoading(false);
            }
        };

        fetchCitasDelDia();
    }, [fecha, isLoggedIn, hasRole, navigate]);

    // Helpers para parsear la hora que devuelve el backend
    const formatearHora = (isoString: string) => {
        if (!isoString) return '';
        // Evitar que `new Date` aplique el timezone local (UTC+1/UTC+2) a fechas devueltas 
        // por la DB si Doctrine las guardó como UTC. Retorna solo el literal "HH:MM".
        if (isoString.includes('T')) {
            return isoString.split('T')[1].substring(0, 5);
        }
        return '';
    };

    const iniciarEdicion = (cita: Cita) => {
        setEditingId(cita.id);
        const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
        setEditData({
            fecha: fechaCita,
            horaInicio: formatearHora(cita.hora_inicio),
            horaFin: formatearHora(cita.hora_fin),
            estado: cita.estado
        });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
    };

    const guardarCambios = async (citaId: number) => {
        try {
            const fStart = editData.fecha + 'T' + editData.horaInicio + ':00';
            const fEnd = editData.fecha + 'T' + editData.horaFin + ':00';
            const fDate = editData.fecha + 'T00:00:00';

            await api.patch(`/citas/${citaId}`, {
                fecha: fDate,
                hora_inicio: fStart,
                hora_fin: fEnd,
                estado: editData.estado
            }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });

            // Actualizar el estado local para reflejar los cambios
            setCitas(prevCitas =>
                prevCitas.map(c => c.id === citaId
                    ? { ...c, fecha: fDate, hora_inicio: fStart, hora_fin: fEnd, estado: editData.estado }
                    : c
                )
            );

            // Si cambio de dia, deberia desaparecer? Podremos filtrar por fecha o recargar.
            if (editData.fecha !== fecha) {
                setCitas(prev => prev.filter(c => c.id !== citaId));
            }

            setEditingId(null);
            alert("✅ Cita actualizada correctamente.");
        } catch (err) {
            console.error("Error guardando cambios:", err);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    // Parseando fecha titulo
    const dateTitle = fecha ? new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Navbar />

            <div
                className="flex-1 bg-cover bg-center bg-no-repeat relative p-6 flex flex-col items-center"
                style={{ backgroundImage: 'url(/Plantilla-Sesion.png)' }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 w-full max-w-4xl mt-8">
                    {/* Botón Volver a la Vista Mensual */}
                    <button
                        onClick={() => navigate('/agenda')}
                        className="text-white bg-sky-600/50 hover:bg-sky-500 backdrop-blur-sm px-6 py-2 rounded-xl transition flex items-center gap-2 mb-6 font-bold"
                    >
                        📅 Volver al Mes
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">
                        Agenda del Día
                    </h1>
                    <h2 className="text-xl text-sky-400 capitalize mb-8">{dateTitle}</h2>

                    {loading ? (
                        <div className="text-center py-12"><div className="animate-spin w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full mx-auto" /></div>
                    ) : error ? (
                        <div className="text-red-400 bg-red-900/30 p-4 rounded-xl text-center border border-red-500/30">{error}</div>
                    ) : citas.length === 0 ? (
                        <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-xl text-white/70">
                            No tienes ninguna reserva apuntada para este día. ¡Día libre! 🎉
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {citas.map((cita) => {
                                const isEditing = editingId === cita.id;

                                return (
                                    <div key={cita.id} className="bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 transition-all">

                                        {/* Información Fija / Lectura */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                                        <span>🕒</span>
                                                        {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                                                    </h3>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cita.estado === 'Confirmada' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                                                    cita.estado === 'Cancelada' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                                                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                                    }`}>
                                                    {cita.estado}
                                                </span>
                                            </div>

                                            <div className="flex flex-col text-white/80">
                                                <span className="font-semibold text-sky-300 text-lg">
                                                    Cliente: {cita.usuario?.nombre || 'Desconocido'} {cita.usuario?.apellidos || ''}
                                                </span>
                                                <span className="text-sm">Tipo de Cita: {cita.tipo_cita}</span>
                                            </div>

                                            {cita.proyectos && cita.proyectos.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-sm font-bold text-white/60 mb-2 uppercase">Proyectos Elegidos:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cita.proyectos.map((p) => (
                                                            <div key={p.id} className="bg-white/5 border border-white/20 px-3 py-2 rounded-lg text-sm text-white">
                                                                {p.titulo}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Formulario de Edición */}
                                        <div className="w-full md:w-72 flex flex-col h-full bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <label className="text-xs text-white/50 uppercase">Fecha de la cita</label>
                                                        <input
                                                            type="date"
                                                            value={editData.fecha}
                                                            onChange={e => setEditData({ ...editData, fecha: e.target.value })}
                                                            className="w-full bg-slate-700 text-white rounded p-2 text-sm mt-1 focus:ring-sky-400"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-white/50 uppercase">Empieza</label>
                                                            <input
                                                                type="time"
                                                                value={editData.horaInicio}
                                                                onChange={e => setEditData({ ...editData, horaInicio: e.target.value })}
                                                                className="w-full bg-slate-700 text-white rounded p-2 text-sm mt-1 focus:ring-sky-400"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs text-white/50 uppercase">Termina (Duración)</label>
                                                            <input
                                                                type="time"
                                                                value={editData.horaFin}
                                                                onChange={e => setEditData({ ...editData, horaFin: e.target.value })}
                                                                className="w-full bg-slate-700 text-white rounded p-2 text-sm mt-1 focus:ring-sky-400"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-white/50 uppercase">Estado</label>
                                                        <select
                                                            value={editData.estado}
                                                            onChange={e => setEditData({ ...editData, estado: e.target.value })}
                                                            className="w-full bg-slate-700 text-white rounded p-2 text-sm mt-1 focus:ring-sky-400"
                                                        >
                                                            <option value="Pendiente">Pendiente</option>
                                                            <option value="Confirmada">Confirmada</option>
                                                            <option value="Cancelada">Cancelada</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => guardarCambios(cita.id)}
                                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded font-bold transition"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelarEdicion}
                                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded font-bold transition"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => iniciarEdicion(cita)}
                                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-lg font-bold transition mt-auto flex items-center justify-center gap-2"
                                                >
                                                    ✍️ Gestionar Cita
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
