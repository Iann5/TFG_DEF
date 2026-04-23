import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Cita } from '../types/perfil';
import { resolveCitaMediaSrc } from '../utils/mediaUrl';

/** API Platform suele devolver IRIs o objetos parciales; obtenemos id para enriquecer. */
function extractEntityId(ref: unknown): number | null {
    if (typeof ref === 'number' && Number.isFinite(ref)) return ref;
    if (typeof ref === 'string') {
        const m = ref.match(/\/(\d+)\s*$/);
        return m ? parseInt(m[1], 10) : null;
    }
    if (ref && typeof ref === 'object' && !Array.isArray(ref)) {
        const o = ref as Record<string, unknown>;
        if (typeof o.id === 'number') return o.id;
        if (typeof o.id === 'string' && /^\d+$/.test(o.id)) return parseInt(o.id, 10);
        if (typeof o['@id'] === 'string') {
            const m = o['@id'].match(/\/(\d+)\s*$/);
            return m ? parseInt(m[1], 10) : null;
        }
    }
    return null;
}

async function enrichCitaImagenes(cita: Cita): Promise<Cita> {
    const out: Cita = { ...cita };

    if (Array.isArray(cita.proyectos) && cita.proyectos.length > 0) {
        const next: NonNullable<Cita['proyectos']> = [];
        for (const raw of cita.proyectos) {
            const id = extractEntityId(raw);
            if (id == null) continue;
            let nombre: string | undefined;
            let imagen: string | undefined;
            if (raw && typeof raw === 'object') {
                const o = raw as Record<string, unknown>;
                if (typeof o.nombre === 'string') nombre = o.nombre;
                if (typeof o.imagen === 'string') imagen = o.imagen;
            }
            if (!imagen) {
                try {
                    const { data } = await api.get<{ nombre?: string; imagen?: string; tituloTatuaje?: string }>(
                        `/proyectos/${id}`
                    );
                    imagen = data.imagen;
                    nombre = nombre ?? data.nombre ?? data.tituloTatuaje;
                } catch {
                    /* sin permiso o no existe */
                }
            }
            next.push({ id, nombre, imagen });
        }
        out.proyectos = next;
    }

    if (Array.isArray(cita.packs) && cita.packs.length > 0) {
        const next: NonNullable<Cita['packs']> = [];
        for (const raw of cita.packs) {
            const id = extractEntityId(raw);
            if (id == null) continue;
            let titulo: string | undefined;
            let imagen: string | undefined;
            if (raw && typeof raw === 'object') {
                const o = raw as Record<string, unknown>;
                if (typeof o.titulo === 'string') titulo = o.titulo;
                if (typeof o.imagen === 'string') imagen = o.imagen;
            }
            if (!imagen) {
                try {
                    const { data } = await api.get<{ titulo?: string; imagen?: string }>(`/packs/${id}`);
                    imagen = data.imagen;
                    titulo = titulo ?? data.titulo;
                } catch {
                    /* */
                }
            }
            next.push({ id, titulo, imagen });
        }
        out.packs = next;
    }

    return out;
}

export function collectCitaImagenes(cita: Cita): string[] {
    const tipo = (cita.tipo_cita || '').toLowerCase();
    const esPersonalizado = tipo.includes('personal');
    const urls: string[] = [];
    const add = (raw?: string | null) => {
        const s = resolveCitaMediaSrc(raw ?? undefined);
        if (s && !urls.includes(s)) urls.push(s);
    };

    if (esPersonalizado) {
        add(cita.imagen);
        cita.proyectos?.forEach((p) => add(p.imagen));
        cita.packs?.forEach((p) => add(p.imagen));
    } else {
        cita.proyectos?.forEach((p) => add(p.imagen));
        cita.packs?.forEach((p) => add(p.imagen));
        add(cita.imagen);
    }
    return urls;
}

export function formatearHora(isoString: string) {
    if (!isoString) return '';
    // Evitar que `new Date` aplique el timezone local (UTC+1/UTC+2) a fechas devueltas 
    // por la DB si Doctrine las guardó como UTC. Retorna solo el literal "HH:MM".
    if (isoString.includes('T')) {
        return isoString.split('T')[1].substring(0, 5);
    }
    return '';
}

export function useVistaDia() {
    const { fecha, trabajadorId } = useParams<{ fecha: string; trabajadorId?: string }>();
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
                let workingId = trabajadorId;
                
                // Si NO viene por la URL (no es admin inspeccionando a otro), pide el propio
                if (!workingId) {
                    const meRes = await api.get('/me');
                    workingId = meRes.data.trabajadorId;
                }

                if (!workingId) {
                    setError('No tienes perfil de trabajador asociado o el ID no es válido.');
                    return;
                }

                // Obtener las citas de ese día para este trabajador (la fecha viaja como parametro exacto)
                const citasRes = await api.get<Cita[]>(`/citas?trabajador=${workingId}&fecha=${fecha}`);

                // Ordenar por hora de inicio (ascendente)
                const ordenadas = citasRes.data.sort((a, b) => {
                    const horaA = new Date(a.hora_inicio).getTime();
                    const horaB = new Date(b.hora_inicio).getTime();
                    return horaA - horaB;
                });

                const conImagenes = await Promise.all(ordenadas.map((c) => enrichCitaImagenes(c)));
                setCitas(conImagenes);
            } catch (err) {
                console.error("Error obteniendo la agenda del día:", err);
                setError('Hubo un error al cargar las citas del día.');
            } finally {
                setLoading(false);
            }
        };

        fetchCitasDelDia();
    }, [fecha, trabajadorId, isLoggedIn, hasRole, navigate]);

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
        } catch (err) {
            console.error("Error guardando cambios:", err);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    // Parseando fecha titulo
    const dateTitle = fecha ? new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return {
        citas,
        loading,
        error,
        editingId,
        editData,
        setEditData,
        trabajadorId,
        navigate,
        iniciarEdicion,
        cancelarEdicion,
        guardarCambios,
        dateTitle
    };
}
