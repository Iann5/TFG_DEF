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
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">engineering</span>
                    Perfil Profesional
                </h2>
                <div className="w-full h-px bg-outline-variant/30 mb-2"></div>
            </div>

            <div className="space-y-8">
                {/* ── ESPECIALIZACIONES ── */}
                <div className="bg-surface-container-highest/30 rounded-sm p-5 border border-outline-variant/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">brush</span>
                    </div>
                    
                    <h3 className="text-primary font-label text-xs uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10 border-b border-outline-variant/20 pb-2">
                        <span className="material-symbols-outlined text-sm">palette</span>
                        Especializaciones
                    </h3>

                    <div className="relative z-10">
                        {/* Desplegable + botón añadir */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <select
                                value={seleccionado}
                                onChange={e => setSeleccionado(e.target.value)}
                                className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant/30 rounded-sm text-on-surface text-sm font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 disabled:opacity-50 transition-all cursor-pointer"
                                disabled={loadingEstilos || disponibles.length === 0}
                            >
                                <option value="">
                                    {loadingEstilos
                                        ? 'Cargando Especializaciones...'
                                        : disponibles.length === 0
                                            ? 'Tienes todos los estilos'
                                            : '— Selecciona Nuevo Estilo —'}
                                </option>
                                {disponibles.map(e => (
                                    <option key={e.id} value={e.id}>{e.nombre}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAnadir}
                                disabled={!seleccionado}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-outline disabled:cursor-not-allowed text-[#00285d] font-label text-xs font-bold uppercase tracking-widest rounded-sm transition-all sm:w-auto w-full flex justify-center items-center gap-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Añadir
                            </button>
                        </div>

                        {/* Sin estilos */}
                        {misEstilos.length === 0 && !loadingEstilos && (
                            <p className="mt-2 text-outline-variant font-label text-[10px] uppercase tracking-widest">Sin especializaciones aún.</p>
                        )}

                        {/* Chips de mis especializaciones */}
                        <div className="mt-5 flex flex-col gap-3">
                            {misEstilos.map(e => {
                                const fotos = fotosMap[e.id] ?? [];
                                const isOpen = expanded === e.id;
                                return (
                                    <div key={e.id} className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-sm overflow-hidden transition-all duration-300">
                                        {/* Cabecera del chip */}
                                        <div className="flex items-center justify-between px-5 py-3">
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : e.id)}
                                                className="text-on-surface font-headline font-semibold text-sm flex items-center gap-3 hover:text-primary transition-colors flex-1 text-left"
                                            >
                                                <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>chevron_right</span>
                                                <span className="uppercase tracking-wider">{e.nombre}</span>
                                                <span className="text-[#8c909f] font-label text-[10px] tracking-widest bg-background/50 px-2 py-0.5 rounded-sm">
                                                    {fotos.length}/3 fotos
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleQuitar(e.id)}
                                                className="text-outline hover:text-error transition-colors p-1 flex items-center justify-center shrink-0"
                                                title="Quitar especialización"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>

                                        {/* Panel de fotos (desplegable) */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-5 pb-5 border-t border-outline-variant/10 pt-4 bg-background/30">
                                                <p className="text-[#8c909f] font-label text-[10px] uppercase tracking-[0.2em] mb-4">Fotos del portafolio (Máx. 3):</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {fotos.map((foto, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-highest border border-outline-variant/20 shadow-sm group">
                                                            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                                            <img src={foto} alt={`Foto ${e.nombre} ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            <button
                                                                onClick={() => handleEliminarFoto(e.id, idx)}
                                                                className="absolute top-2 right-2 bg-error hover:bg-error/80 text-on-error w-6 h-6 rounded-sm text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"
                                                                title="Eliminar foto"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Slot para añadir foto */}
                                                    {fotos.length < 3 && (
                                                        <button
                                                            onClick={() => fileRefs.current[e.id]?.click()}
                                                            className="aspect-square rounded-sm border hover:border-primary bg-surface-container-highest/50 hover:bg-surface-container transition-all flex flex-col items-center justify-center text-outline hover:text-primary group border-dashed"
                                                        >
                                                            <span className="material-symbols-outlined text-2xl mb-1 group-hover:scale-110 transition-transform">add_photo_alternate</span>
                                                            <span className="font-label text-[10px] uppercase tracking-widest mt-1">Añadir Foto</span>
                                                        </button>
                                                    )}

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={el => { fileRefs.current[e.id] = el; }}
                                                        onChange={ev => handleFotoChange(e.id, ev)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── DESCRIPCIÓN ── */}
                <div className="bg-surface-container-highest/30 rounded-sm p-5 border border-outline-variant/20">
                    <h3 className="text-primary font-label text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                        <span className="material-symbols-outlined text-sm">edit_document</span>
                        Biografía / Descripción
                    </h3>
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Describe tu filosofía artística y experiencia en el estudio..."
                            rows={4}
                            className="w-full px-4 py-3 bg-surface-container border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-y transition-all"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleGuardarConfig}
                                disabled={guardandoDesc || !trabajadorId}
                                className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-on-secondary font-label font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">{guardandoDesc ? 'sync' : 'save'}</span>
                                {guardandoDesc ? 'Guardando...' : 'Guardar Info'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── AGENDA ── */}
                <button
                    onClick={() => navigate('/agenda')}
                    className="w-full bg-surface-container hover:bg-surface-container-low border border-outline-variant/30 hover:border-primary text-on-surface font-headline font-bold text-sm uppercase tracking-wider py-4 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">event_available</span>
                    Gestionar tu Agenda
                </button>

                {/* ── TARIFAS Y TIEMPOS ── */}
                <div className="bg-surface-container-highest/30 rounded-sm p-5 border border-outline-variant/20">
                    <h3 className="text-primary font-label text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Tarifas y Tiempos de Trabajo
                    </h3>

                    {/* Formulario Añadir/Actualizar */}
                    <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/20 mb-6">
                        <span className="font-label text-[#8c909f] text-[10px] uppercase tracking-[0.2em] mb-3 block">Configurar Nueva Tarifa</span>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-on-surface font-label text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-outline">straighten</span>
                                    Tamaño (cm)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cmInput}
                                    onChange={e => setCmInput(Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors text-center"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-on-surface font-label text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
                                    Minutos Estimados
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={minInput}
                                    onChange={e => setMinInput(Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors text-center"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-on-surface font-label text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-outline">euro</span>
                                    Precio Base (€)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={precioInput}
                                    onChange={e => setPrecioInput(Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors text-center text-primary font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleGuardarTarifa}
                                disabled={guardandoTarifas || !trabajadorId}
                                className="bg-[#2e5d36] hover:bg-[#3d7a47] disabled:opacity-50 text-white font-label font-bold text-[10px] uppercase tracking-[0.2em] py-2.5 px-6 rounded-sm transition-all sm:w-auto w-full flex justify-center items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">save</span>
                                {guardandoTarifas ? 'Guardando...' : 'Aplicar Tarifa'}
                            </button>
                        </div>
                    </div>

                    {/* Lista visual de tarifas */}
                    {tarifas && tarifas.length > 0 ? (
                        <div className="mt-2">
                            <h4 className="text-[#8c909f] font-label text-[10px] uppercase tracking-[0.2em] mb-3">Tarifas Actuales:</h4>
                            <div className="flex flex-col gap-2">
                                {tarifas.map((t, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-container/50 border border-outline-variant/20 px-4 py-3 rounded-sm hover:bg-surface-container transition-colors group gap-3">
                                        <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto overflow-hidden">
                                            <div className="flex flex-col">
                                                <span className="font-label text-[10px] text-outline uppercase tracking-wider mb-0.5">Tamaño</span>
                                                <span className="text-secondary font-headline font-bold">{t.cm} cm</span>
                                            </div>
                                            <div className="w-px h-8 bg-outline-variant/30 hidden sm:block"></div>
                                            <div className="flex flex-col">
                                                <span className="font-label text-[10px] text-outline uppercase tracking-wider mb-0.5">Tiempo</span>
                                                <span className="text-on-surface-variant font-body text-sm">{t.minutos} min</span>
                                            </div>
                                            <div className="w-px h-8 bg-outline-variant/30 hidden sm:block"></div>
                                            <div className="flex flex-col">
                                                <span className="font-label text-[10px] text-outline uppercase tracking-wider mb-0.5">Precio</span>
                                                <span className="text-primary font-headline font-bold">{t.precio} €</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEliminarTarifa(t.cm)}
                                            className="w-full sm:w-auto text-error bg-error-container/20 hover:bg-error-container hover:text-on-error border border-error/20 hover:border-error/50 px-3 py-1.5 rounded-sm font-label text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-surface-container/30 border border-outline-variant/20 border-dashed rounded-sm mt-4">
                            <span className="material-symbols-outlined text-outline-variant text-3xl mb-2">money_off</span>
                            <p className="text-on-surface-variant font-body text-sm">Aún no has configurado tarifas.</p>
                            <p className="text-[#8c909f] font-label text-[10px] uppercase tracking-widest mt-1">Añade tu primera tarifa de trabajo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
