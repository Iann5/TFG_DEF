import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Estilo } from '../../types/perfil';

interface Props {
    estilosIniciales: Estilo[];
    descripcionInicial?: string;
    trabajadorId?: number;
}

export default function PanelTrabajador({ estilosIniciales, descripcionInicial = '', trabajadorId }: Props) {
    const navigate = useNavigate();
    const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // ── Descripción ────────────────────────────────────────────────
    const [descripcion, setDescripcion] = useState(descripcionInicial);
    const [guardandoDesc, setGuardandoDesc] = useState(false);

    // ── Especializaciones ──────────────────────────────────────────
    const [todosEstilos, setTodosEstilos] = useState<Estilo[]>([]);
    const [misEstilos, setMisEstilos] = useState<Estilo[]>(estilosIniciales);
    const [seleccionado, setSeleccionado] = useState('');
    const [loadingEstilos, setLoadingEstilos] = useState(true);

    // ── Fotos de ejemplo por estilo (max 3) ────────────────────────
    const [fotosMap, setFotosMap] = useState<Record<number, string[]>>({});
    const [expanded, setExpanded] = useState<number | null>(null); // estilo expandido

    // Cargar todos los estilos de BD
    useEffect(() => {
        api.get<(Estilo & { imagenes?: string[] })[]>('/estilos')
            .then(res => {
                const lista = res.data;
                setTodosEstilos(lista.map(e => ({ id: e.id, nombre: e.nombre })));
                // Precarga las fotos que ya tenga cada estilo en BD
                const mapa: Record<number, string[]> = {};
                lista.forEach(e => { if (e.imagenes?.length) mapa[e.id] = e.imagenes; });
                setFotosMap(mapa);
            })
            .catch(() => {/* silencioso */ })
            .finally(() => setLoadingEstilos(false));
    }, []);

    // Sincronizar mis estilos cuando lleguen las props iniciales
    useEffect(() => {
        setMisEstilos(estilosIniciales);
    }, [estilosIniciales]);

    // Sincronizar descripción cuando llegue la prop inicial
    useEffect(() => {
        setDescripcion(descripcionInicial);
    }, [descripcionInicial]);

    // Solo muestra en el desplegable los que NO tengo aún
    const misIds = new Set(misEstilos.map(e => e.id));
    const disponibles = todosEstilos.filter(e => !misIds.has(e.id));

    // ── Añadir estilo ──────────────────────────────────────────────
    const handleAnadir = async () => {
        if (!seleccionado) return;
        const estilo = todosEstilos.find(e => e.id === Number(seleccionado));
        if (!estilo) return;
        try {
            await api.post(`/trabajador/estilos/add/${estilo.id}`);
            setMisEstilos(prev => [...prev, estilo]);
            setSeleccionado('');
        } catch (err) {
            console.error('Error añadiendo estilo:', err);
        }
    };

    // ── Quitar estilo ──────────────────────────────────────────────
    const handleQuitar = async (estiloId: number) => {
        try {
            await api.delete(`/trabajador/estilos/remove/${estiloId}`);
            setMisEstilos(prev => prev.filter(e => e.id !== estiloId));
            if (expanded === estiloId) setExpanded(null);
        } catch (err) {
            console.error('Error quitando estilo:', err);
        }
    };

    // ── Subir foto de ejemplo (máx 3) ──────────────────────────────
    const handleFotoChange = async (estiloId: number, e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const actual = fotosMap[estiloId] ?? [];
        if (actual.length >= 3) return;

        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = async () => {
            const nueva = reader.result as string;
            const nuevas = [...actual, nueva];
            setFotosMap(prev => ({ ...prev, [estiloId]: nuevas }));
            try {
                await api.put(`/trabajador/estilos/${estiloId}/fotos`, { imagenes: nuevas });
            } catch (err) {
                console.error('Error guardando fotos:', err);
            }
        };
    };

    // ── Eliminar foto de ejemplo ────────────────────────────────────
    const handleEliminarFoto = async (estiloId: number, idx: number) => {
        const nuevas = (fotosMap[estiloId] ?? []).filter((_, i) => i !== idx);
        setFotosMap(prev => ({ ...prev, [estiloId]: nuevas }));
        try {
            await api.put(`/trabajador/estilos/${estiloId}/fotos`, { imagenes: nuevas });
        } catch (err) {
            console.error('Error eliminando foto:', err);
        }
    };
    // ── Guardar descripción ────────────────────────────────────────
    const handleGuardarDescripcion = async () => {
        if (!trabajadorId) return;
        setGuardandoDesc(true);
        try {
            await api.patch(`/trabajadors/${trabajadorId}`, { descripcion }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
        } catch (err) {
            console.error('Error guardando descripción:', err);
        } finally {
            setGuardandoDesc(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-1">Perfil Profesional</h2>
            <hr className="border-white/40 mb-4" />

            <div className="space-y-5">

                {/* ── ESPECIALIZACIONES ── */}
                <div>
                    <label className="block text-white/70 text-xs mb-2 font-medium uppercase tracking-wide">
                        Especializaciones
                    </label>

                    {/* Desplegable + botón añadir */}
                    <div className="flex gap-2">
                        <select
                            value={seleccionado}
                            onChange={e => setSeleccionado(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-600/70 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
                            disabled={loadingEstilos || disponibles.length === 0}
                        >
                            <option value="">
                                {loadingEstilos
                                    ? 'Cargando...'
                                    : disponibles.length === 0
                                        ? 'Tienes todos los estilos'
                                        : '— Añadir especialización —'}
                            </option>
                            {disponibles.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAnadir}
                            disabled={!seleccionado}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-sm shrink-0"
                        >
                            + Añadir
                        </button>
                    </div>

                    {/* Sin estilos */}
                    {misEstilos.length === 0 && !loadingEstilos && (
                        <p className="mt-2 text-white/40 text-xs">Sin especializaciones aún.</p>
                    )}

                    {/* Chips de mis especializaciones (expandibles para gestionar fotos) */}
                    <div className="mt-3 space-y-2">
                        {misEstilos.map(e => {
                            const fotos = fotosMap[e.id] ?? [];
                            const isOpen = expanded === e.id;
                            return (
                                <div key={e.id} className="bg-indigo-900/40 border border-indigo-400/30 rounded-xl overflow-hidden">
                                    {/* Cabecera del chip */}
                                    <div className="flex items-center justify-between px-4 py-2">
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : e.id)}
                                            className="text-white font-semibold text-sm flex items-center gap-2 hover:text-sky-300 transition"
                                        >
                                            <span>{isOpen ? '▾' : '▸'}</span>
                                            {e.nombre}
                                            <span className="text-white/40 text-xs">({fotos.length}/3 fotos)</span>
                                        </button>
                                        <button
                                            onClick={() => handleQuitar(e.id)}
                                            className="text-white/50 hover:text-red-400 transition text-xs font-bold"
                                            title="Quitar especialización"
                                        >
                                            ✕ Quitar
                                        </button>
                                    </div>

                                    {/* Panel de fotos (desplegable) */}
                                    {isOpen && (
                                        <div className="px-4 pb-4 border-t border-indigo-400/20 pt-3">
                                            <p className="text-white/50 text-xs mb-2">Fotos de ejemplo (máx. 3):</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {fotos.map((foto, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-700">
                                                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => handleEliminarFoto(e.id, idx)}
                                                            className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none"
                                                            title="Eliminar foto"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Slot para añadir foto (si hay < 3) */}
                                                {fotos.length < 3 && (
                                                    <button
                                                        onClick={() => fileRefs.current[e.id]?.click()}
                                                        className="aspect-square rounded-lg border-2 border-dashed border-indigo-400/40 bg-slate-700/50 hover:border-sky-400 hover:bg-slate-600/50 transition flex flex-col items-center justify-center text-white/40 hover:text-sky-300"
                                                    >
                                                        <span className="text-2xl">+</span>
                                                        <span className="text-xs">Añadir foto</span>
                                                    </button>
                                                )}

                                                {/* Input oculto por estilo */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={el => { fileRefs.current[e.id] = el; }}
                                                    onChange={ev => handleFotoChange(e.id, ev)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <hr className="border-white/20" />

                {/* ── DESCRIPCIÓN ── */}
                <div>
                    <label className="block text-white/70 text-xs mb-1 font-medium uppercase tracking-wide">
                        Descripción
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Describe tu estilo y experiencia..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-600/50 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                    <button
                        onClick={handleGuardarDescripcion}
                        disabled={guardandoDesc || !trabajadorId}
                        className="mt-2 w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition text-sm"
                    >
                        {guardandoDesc ? 'Guardando...' : 'Guardar Descripción'}
                    </button>
                </div>

                <hr className="border-white/20" />

                {/* ── AGENDA ── */}
                <button
                    onClick={() => navigate('/agenda')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
                >
                    📅 Agenda
                </button>
            </div>
        </div>
    );
}
