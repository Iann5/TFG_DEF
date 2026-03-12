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
import { type ValoracionDetalle } from '../types/Valoracion';

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

interface RawValoracion {
    id: number;
    estrellas: number;
    comentario?: string;
    fecha: string;
    usuario?: { nombre?: string; foto_perfil?: string; };
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

function mapRawVals(raw: RawValoracion[]): ValoracionDetalle[] {
    return raw.map(v => ({
        id: v.id,
        estrellas: v.estrellas,
        comentario: v.comentario,
        fecha: v.fecha,
        nombreUsuario: v.usuario?.nombre ?? 'Usuario',
        fotoPerfil: v.usuario?.foto_perfil,
    }));
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
    const { isLoggedIn } = useAuth();

    const [trabajador, setTrabajador] = useState<TrabajadorDetalle | null>(null);
    const [proyectos, setProyectos] = useState<ProyectoMini[]>([]);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenTrabajos, setOrdenTrabajos] = useState<string[]>([]);
    const [nombreUsuario] = useState<string | null>(localStorage.getItem('userName'));

    const valsEndpoint = `/valoracion_trabajadors?trabajador=${encodeURIComponent(`/api/trabajadors/${trabajadorId}`)}`;

    const recargarValoraciones = async () => {
        const res = await api.get<RawValoracion[]>(valsEndpoint);
        setValoraciones(mapRawVals(Array.isArray(res.data) ? res.data : []));
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
                setValoraciones(mapRawVals(Array.isArray(vRes.data) ? vRes.data : []));
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
    const yaValoró = isLoggedIn && nombreUsuario != null && valoraciones.some(v => v.nombreUsuario === nombreUsuario);
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 bg-[#1C1B28] border border-[#3B82F6]/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#1C1B28] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl">Perfil del artista</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition">
                        <X size={22} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-white animate-pulse">Cargando...</p>
                    </div>
                ) : !trabajador ? (
                    <p className="text-red-400 text-center py-20">Trabajador no encontrado.</p>
                ) : (
                    <div className="p-6 space-y-8">

                        {/* ── Perfil ── */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="w-36 h-36 rounded-2xl bg-[#9CA3AF] overflow-hidden shrink-0 border border-white/10">
                                {imagen
                                    ? <img src={imagen} alt={trabajador.nombre} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-3xl">IMG</div>
                                }
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{nombreArtista}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StarRating value={media} size={16} />
                                            <span className="text-yellow-400 text-sm font-bold">
                                                {media > 0 ? media.toFixed(1) : 'Sin valoraciones'}
                                            </span>
                                            <span className="text-white/30 text-xs">({valoraciones.length})</span>
                                        </div>
                                    </div>

                                    {/* Botón pedir cita */}
                                    {isLoggedIn ? (
                                        <button
                                            onClick={() => navigate('/cita')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition text-sm"
                                        >
                                            <Calendar size={16} /> Pedir cita
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-sm border border-white/10"
                                        >
                                            <Calendar size={16} /> Pedir cita (inicia sesión)
                                        </button>
                                    )}
                                </div>

                                {trabajador.descripcion && (
                                    <p className="text-white/70 text-sm leading-relaxed mt-3 bg-[#323444] rounded-xl p-4">
                                        {trabajador.descripcion}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                    {email && (
                                        <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition">
                                            <Mail size={14} /> {email}
                                        </a>
                                    )}
                                    {telefono && (
                                        <a href={`tel:${telefono}`} className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition">
                                            <Phone size={14} /> {telefono}
                                        </a>
                                    )}
                                </div>

                                {trabajador.estilos && trabajador.estilos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {trabajador.estilos.map(e => (
                                            <span key={e.id} className="bg-sky-900/40 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30">
                                                {e.nombre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Trabajos ── */}
                        <section>
                            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                <h3 className="text-white font-bold text-lg">
                                    Trabajos ({proyectosFiltrados.length})
                                </h3>
                                <MultiSelect
                                    placeholder="Ordenar / filtrar"
                                    options={ORDEN_TRABAJOS_OPTS}
                                    selected={ordenTrabajos}
                                    onChange={setOrdenTrabajos}
                                />
                            </div>

                            {proyectosFiltrados.length === 0 ? (
                                <p className="text-white/40 text-sm text-center py-8">Sin trabajos para mostrar.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {proyectosFiltrados.map(p => (
                                        <TarjetaMiniProyecto key={p.id} proyecto={p} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ── Valoraciones ── */}
                        <section>
                            <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                                <Star className="fill-yellow-400 text-yellow-400" size={18} />
                                Valoraciones del artista
                            </h3>

                            <div className="mb-6">
                                {!isLoggedIn ? (
                                    <div className="bg-[#1C1B28] border border-white/10 rounded-2xl p-5 text-center">
                                        <p className="text-white/60 mb-3 text-sm">Inicia sesión para dejar tu valoración.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition"
                                        >
                                            Iniciar sesión
                                        </button>
                                    </div>
                                ) : yaValoró ? (
                                    <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-5 text-center text-sky-300 font-semibold text-sm">
                                        ✅ Ya has valorado a este artista.
                                    </div>
                                ) : (
                                    <FormularioValoracion
                                        trabajadorId={trabajadorId}
                                        onValoracionEnviada={recargarValoraciones}
                                    />
                                )}
                            </div>

                            <ListaComentarios valoraciones={valoraciones} />
                        </section>

                    </div>
                )}
            </div>
        </div>
    );
}
