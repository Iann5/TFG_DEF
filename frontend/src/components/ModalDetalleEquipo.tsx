// src/components/ModalDetalleEquipo.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Mail, Calendar, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import ListaComentarios from './ListaComentarios';
import FormularioValoracion from './FormularioValoracion';
import MultiSelect from './MultiSelect';
import TarjetaMiniProyecto, { type ProyectoMini, mediaProyecto } from './TarjetaMiniProyecto';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TrabajadorDetalle {
    id: number;
    nombre: string;
    descripcion?: string;
    email?: string;
    telefono?: string;
    imagen?: string;
    usuario?: { nombre?: string; apellidos?: string; email?: string; telefono?: string; foto_perfil?: string };
    estilos?: { id: number; nombre: string }[];
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const ORDEN_TRABAJOS_OPTS = [
    { value: 'reciente', label: 'Más reciente' },
    { value: 'antiguo', label: 'Más antiguo' },
    { value: 'val_desc', label: 'Mayor valoración' },
    { value: 'val_asc', label: 'Menor valoración' },
    { value: 'plantilla', label: 'Solo plantillas' },
    { value: 'tatuaje', label: 'Solo tatuajes' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mediaValoraciones(vals: ValoracionDetalle[]): number {
    if (!vals.length) return 0;
    return vals.reduce((a, v) => a + v.estrellas, 0) / vals.length;
}

function aplicarFiltros(proyectos: ProyectoMini[], ordenTrabajos: string[]): ProyectoMini[] {
    let list = [...proyectos];

    // Filtros de tipo
    const tipos: string[] = [];
    if (ordenTrabajos.includes('plantilla')) tipos.push('plantilla');
    if (ordenTrabajos.includes('tatuaje')) tipos.push('tatuaje');
    if (tipos.length > 0) {
        list = list.filter(p => tipos.some(t => p.tipo?.toLowerCase().includes(t)));
    }

    // Ordenación — la última seleccionada tiene prioridad
    const ordenActivo = ordenTrabajos.filter(o => ['reciente', 'antiguo', 'val_desc', 'val_asc'].includes(o)).at(-1);
    if (ordenActivo === 'reciente') list.sort((a, b) => new Date(b.fecha_subida ?? 0).getTime() - new Date(a.fecha_subida ?? 0).getTime());
    else if (ordenActivo === 'antiguo') list.sort((a, b) => new Date(a.fecha_subida ?? 0).getTime() - new Date(b.fecha_subida ?? 0).getTime());
    else if (ordenActivo === 'val_desc') list.sort((a, b) => mediaProyecto(b) - mediaProyecto(a));
    else if (ordenActivo === 'val_asc') list.sort((a, b) => mediaProyecto(a) - mediaProyecto(b));

    return list;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
    trabajadorId: number;
    onClose: () => void;
}

export default function ModalDetalleEquipo({ trabajadorId, onClose }: Props) {
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const isTrabajadorOrAdmin = hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN');

    const [trabajador, setTrabajador] = useState<TrabajadorDetalle | null>(null);
    const [proyectos, setProyectos] = useState<ProyectoMini[]>([]);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenTrabajos, setOrdenTrabajos] = useState<string[]>([]);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
        setCurrentUserId(isLoggedIn ? getStoredUserId() : null);
    }, [isLoggedIn]);

    const valsEndpoint = `/valoracion_trabajadors?trabajador=${encodeURIComponent(`/api/trabajadors/${trabajadorId}`)}`;

    const recargarValoraciones = async () => {
        const res = await api.get<RawValoracion[]>(valsEndpoint);
        setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
    };

    useEffect(() => {
        Promise.all([
            api.get<TrabajadorDetalle>(`/trabajadors/${trabajadorId}`),
            api.get<ProyectoMini[]>(`/proyectos?autor=${encodeURIComponent(`/api/trabajadors/${trabajadorId}`)}`),
            api.get<RawValoracion[]>(valsEndpoint),
        ])
            .then(([tRes, pRes, vRes]) => {
                setTrabajador(tRes.data);
                setProyectos(Array.isArray(pRes.data) ? pRes.data : []);
                setValoraciones(mapearValoraciones(Array.isArray(vRes.data) ? vRes.data : []));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [trabajadorId]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const proyectosFiltrados = aplicarFiltros(proyectos, ordenTrabajos);
    const media = mediaValoraciones(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);
    const nombreArtista = trabajador?.usuario?.nombre
        ? `${trabajador.usuario.nombre} ${trabajador?.usuario?.apellidos || ''}`
        : 'Artista Desconocido';
    const email = trabajador?.usuario?.email ?? null;
    const telefono = trabajador?.usuario?.telefono ?? null;
    const imagen = trabajador?.usuario?.foto_perfil ?? null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 glass-panel border border-outline-variant/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm">

                {/* Header */}
                <div className="sticky top-0 z-20 bg-surface-container-highest/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-on-surface font-headline text-2xl uppercase tracking-widest">PERFIL DEL ARTISTA</h2>
                    <button onClick={onClose} className="text-outline hover:text-error transition-colors">
                        <X size={28} strokeWidth={2} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-white animate-pulse">Cargando...</p>
                    </div>
                ) : !trabajador ? (
                    <p className="text-red-400 text-center py-20">Trabajador no encontrado.</p>
                ) : (
                    <div className="p-6 md:p-8 space-y-12">

                        {/* ── Perfil ── */}
                        <div className="flex flex-col sm:flex-row gap-8 bg-surface-container/50 border border-outline-variant/20 p-6 md:p-8 rounded-sm">
                            <div className="w-40 h-40 border border-outline-variant/30 bg-surface-container overflow-hidden shrink-0 relative group">
                                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
                                {imagen
                                    ? <img src={imagen} alt={trabajador.nombre} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    : <div className="w-full h-full flex items-center justify-center text-outline-variant font-headline text-5xl tracking-widest opacity-30">IMG</div>
                                }
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-4xl md:text-5xl font-headline text-primary uppercase tracking-tight">{nombreArtista}</h3>
                                        <div className="flex items-center gap-2 mt-4 bg-surface-container-highest border border-outline-variant/30 px-3 py-1.5 inline-flex rounded-sm">
                                            <StarRating value={media} size={16} />
                                            <span className="text-on-surface font-label text-xs tracking-widest ml-2 leading-none mt-0.5">
                                                {media > 0 ? media.toFixed(1) : 'Nuevo'}
                                            </span>
                                            <span className="text-outline-variant font-body text-xs ml-1">({valoraciones.length})</span>
                                        </div>
                                    </div>

                                    {/* Botón pedir cita */}
                                    {!isTrabajadorOrAdmin && (
                                        isLoggedIn ? (
                                            <button
                                                onClick={() => navigate('/cita')}
                                                className="flex items-center gap-3 px-6 py-3 primary-gradient-cta hover:bg-primary-hover font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all"
                                            >
                                                <Calendar size={18} strokeWidth={2} /> PEDIR CITA
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="flex items-center gap-3 px-6 py-3 bg-surface-container border border-outline-variant/30 hover:border-primary/50 text-on-surface font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all text-center"
                                            >
                                                <Calendar size={18} strokeWidth={2} /> PEDIR CITA (LOGIN)
                                            </button>
                                        )
                                    )}
                                </div>

                                {trabajador.descripcion && (
                                    <p className="text-on-surface-variant font-body text-sm leading-relaxed mt-6 bg-surface-container/30 border-l border-primary p-4 rounded-r-sm">
                                        {trabajador.descripcion}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-6 font-label text-xs uppercase tracking-widest text-outline-variant">
                                    {email && (
                                        <a href={`mailto:${email}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors bg-surface-container-highest border border-outline-variant/30 px-3 py-1.5 rounded-sm">
                                            <Mail size={16} strokeWidth={2} /> {email}
                                        </a>
                                    )}
                                    {telefono && (
                                        <a href={`tel:${telefono}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors bg-surface-container-highest border border-outline-variant/30 px-3 py-1.5 rounded-sm">
                                            <Phone size={16} strokeWidth={2} /> {telefono}
                                        </a>
                                    )}
                                </div>

                                {trabajador.estilos && trabajador.estilos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {trabajador.estilos.map(e => (
                                            <span key={e.id} className="bg-primary/10 text-primary font-label tracking-widest text-[10px] uppercase px-3 py-1.5 border border-primary/20 rounded-sm">
                                                {e.nombre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Trabajos ── */}
                        <section className="bg-surface-container/50 border border-outline-variant/20 p-6 md:p-8 rounded-sm">
                            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap border-b border-outline-variant/30 pb-4">
                                <h3 className="text-on-surface font-headline text-3xl uppercase tracking-widest">
                                    TRABAJOS ({proyectosFiltrados.length})
                                </h3>
                                <div className="w-full sm:w-64">
                                    <MultiSelect
                                        placeholder="ORDENAR / FILTRAR"
                                        options={ORDEN_TRABAJOS_OPTS}
                                        selected={ordenTrabajos}
                                        onChange={setOrdenTrabajos}
                                    />
                                </div>
                            </div>

                            {proyectosFiltrados.length === 0 ? (
                                <p className="text-outline-variant font-label text-xs uppercase tracking-widest text-center py-12">No hay trabajos para mostrar.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {proyectosFiltrados.map(p => (
                                        <TarjetaMiniProyecto key={p.id} proyecto={p} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ── Valoraciones ── */}
                        <section className="bg-surface-container/50 border border-outline-variant/20 p-6 md:p-8 rounded-sm">
                            <h3 className="text-on-surface font-headline text-3xl uppercase tracking-widest flex items-center gap-3 mb-8 border-b border-outline-variant/30 pb-4">
                                <Star className="fill-tertiary text-tertiary" size={24} strokeWidth={2} />
                                VALORACIONES
                            </h3>

                            <div className="mb-12">
                                {!isLoggedIn ? (
                                    <div className="bg-surface-container-highest border border-outline-variant/30 p-8 text-center rounded-sm">
                                        <p className="text-on-surface-variant font-body mb-6 text-sm">Inicia sesión para dejar tu valoración.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-8 py-3 bg-surface-container hover:bg-surface-container-high border border-outline hover:border-primary text-on-surface font-label tracking-[0.2em] text-xs uppercase rounded-sm transition-colors mx-auto block"
                                        >
                                            INICIAR SESIÓN
                                        </button>
                                    </div>
                                ) : yaValoró ? (
                                    <div className="bg-secondary-container/20 border border-secondary/30 rounded-sm p-5 text-center text-secondary font-label tracking-[0.1em] text-xs uppercase">
                                        Ya has valorado a este artista.
                                    </div>
                                ) : (
                                    <FormularioValoracion
                                        trabajadorId={trabajadorId}
                                        onValoracionEnviada={recargarValoraciones}
                                    />
                                )}
                            </div>

                            <ListaComentarios
                                valoraciones={valoraciones}
                                valoracionApiSegment="valoracion_trabajadors"
                                currentUserId={currentUserId}
                                onValoracionCambiada={recargarValoraciones}
                            />
                        </section>

                    </div>
                )}
            </div>
        </div>
    );
}
