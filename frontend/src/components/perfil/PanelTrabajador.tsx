import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Estilo } from '../../types/perfil';

interface Props {
    estilosIniciales: Estilo[];
    descripcionInicial?: string;
    tarifasIniciales?: { cm: number; minutos: number; precio: number }[];
    trabajadorId?: number;
}

export default function PanelTrabajador({ estilosIniciales, descripcionInicial = '', tarifasIniciales = [], trabajadorId }: Props) {
    const navigate = useNavigate();
    const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // ── Configuración General (Descripción, Precios, Tiempos) ──────
    const [descripcion, setDescripcion] = useState(descripcionInicial);
    const [guardandoDesc, setGuardandoDesc] = useState(false);

    // ── Tarifas (JSON array) ───────────────────────────────────────
    const [tarifas, setTarifas] = useState<{ cm: number; minutos: number; precio: number }[]>(tarifasIniciales);
    const [cmInput, setCmInput] = useState(10);
    const [minInput, setMinInput] = useState(60);
    const [precioInput, setPrecioInput] = useState(0);
    const [guardandoTarifas, setGuardandoTarifas] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(estilosIniciales)]);

    // Sincronizar datos iniciales cuando lleguen las props
    useEffect(() => {
        setDescripcion(descripcionInicial);
        setTarifas(tarifasIniciales);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [descripcionInicial, JSON.stringify(tarifasIniciales)]);

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
    // ── Guardar Descripción ────────────────────────────────────────
    const handleGuardarConfig = async () => {
        if (!trabajadorId) return;
        setGuardandoDesc(true);
        try {
            await api.patch(`/trabajadors/${trabajadorId}`, { descripcion }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
        } catch (err) {
            console.error('Error guardando configuración:', err);
        } finally {
            setGuardandoDesc(false);
        }
    };

    // ── Guardar Tarifa ─────────────────────────────────────────────
    const handleGuardarTarifa = async () => {
        if (!trabajadorId || cmInput <= 0 || minInput <= 0 || precioInput < 0) return;
        setGuardandoTarifas(true);

        const tarifaActualizada = { cm: cmInput, minutos: minInput, precio: precioInput };

        let nuevasTarifas = [...tarifas];
        const index = nuevasTarifas.findIndex(t => t.cm === cmInput);
        if (index >= 0) {
            nuevasTarifas[index] = tarifaActualizada; // Sobreescribe si existe
        } else {
            nuevasTarifas.push(tarifaActualizada);
        }
        nuevasTarifas.sort((a, b) => a.cm - b.cm); // Mantener el JSON ordenado

        try {
            await api.patch(`/trabajadors/${trabajadorId}`, { tarifas: nuevasTarifas }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
            setTarifas(nuevasTarifas);
            // Optionally clear or leave inputs
        } catch (err) {
            console.error('Error guardando tarifa:', err);
            alert("No se ha podido guardar la tarifa.");
        } finally {
            setGuardandoTarifas(false);
        }
    };

    // ── Eliminar Tarifa ────────────────────────────────────────────
    const handleEliminarTarifa = async (cmToRemove: number) => {
        if (!trabajadorId) return;
        const nuevasTarifas = tarifas.filter(t => t.cm !== cmToRemove);
        try {
            await api.patch(`/trabajadors/${trabajadorId}`, { tarifas: nuevasTarifas }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
            setTarifas(nuevasTarifas);
        } catch (err) {
            console.error('Error eliminando tarifa:', err);
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
                <div className="bg-slate-700/30 p-5 rounded-xl border border-white/10 mb-4">
                    <h3 className="text-white font-bold mb-4 text-sm tracking-wide">📝 Descripción del Perfil</h3>
                    <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Describe tu estilo y experiencia..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-600/50 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleGuardarConfig}
                            disabled={guardandoDesc || !trabajadorId}
                            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition text-sm shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                        >
                            {guardandoDesc ? 'Guardando...' : 'Guardar Descripción'}
                        </button>
                    </div>
                </div>

                <hr className="border-white/20" />

                {/* ── AGENDA ── */}
                <button
                    onClick={() => navigate('/agenda')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
                >
                    📅 Agenda
                </button>

                <hr className="border-white/20" />

                {/* ── CONFIGURACIÓN DE TARIFAS Y TIEMPOS ── */}
                <div className="bg-slate-700/30 p-5 rounded-xl border border-white/10 mb-4">
                    <h3 className="text-white font-bold mb-4 text-sm tracking-wide flex items-center gap-2">
                        <span>🏷️</span> Tus Tarifas y Tiempos
                    </h3>

                    {/* Formulario Añadir/Actualizar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-white/70 text-xs mb-1 font-medium uppercase tracking-wide">
                                Tamaño (cm)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={cmInput}
                                onChange={e => setCmInput(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-600/50 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white/70 text-xs mb-1 font-medium uppercase tracking-wide">
                                Minutos
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={minInput}
                                onChange={e => setMinInput(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-600/50 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white/70 text-xs mb-1 font-medium uppercase tracking-wide">
                                Precio Base (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={precioInput}
                                onChange={e => setPrecioInput(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-600/50 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleGuardarTarifa}
                            disabled={guardandoTarifas || !trabajadorId}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition text-sm shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                        >
                            {guardandoTarifas ? 'Guardando...' : 'Guardar / Actualizar Tarifa'}
                        </button>
                    </div>

                    {/* Lista visual de tarifas almacenadas */}
                    {tarifas && tarifas.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <h4 className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Tus tarifas configuradas</h4>
                            <div className="flex flex-col gap-2">
                                {tarifas.map((t, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-lg hover:bg-white/10 transition">
                                        <div className="flex gap-6 text-sm">
                                            <span className="text-sky-300 font-bold w-12">{t.cm} cm</span>
                                            <span className="text-white/80 w-24">{t.minutos} min</span>
                                            <span className="text-green-300 font-bold">{t.precio} €</span>
                                        </div>
                                        <button
                                            onClick={() => handleEliminarTarifa(t.cm)}
                                            className="text-red-400 hover:text-white bg-red-900/40 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
