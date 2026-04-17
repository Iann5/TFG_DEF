import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFavoritesStorageKey } from '../../utils/authUtils';

import type { CitaForm, Trabajador } from '../../types/Citas';
import type { RawProyecto } from '../../types/proyecto';

interface Props {
    formData: CitaForm;
    setFormData: (data: CitaForm) => void;
    trabajadores: Trabajador[];
    plantillasTrabajador: RawProyecto[];
    onBack: () => void;
    onNext: () => void;
}

export default function Paso4DetallesTatuaje({
    formData,
    setFormData,
    trabajadores,
    plantillasTrabajador,
    onBack,
    onNext
}: Props) {
    const { isLoggedIn } = useAuth();
    const [favoritos, setFavoritos] = useState<number[]>([]);

    useEffect(() => {
        const storageKey = getFavoritesStorageKey();
        if (storageKey && isLoggedIn) {
            const favsGuardados = localStorage.getItem(storageKey);
            if (favsGuardados) {
                setFavoritos(JSON.parse(favsGuardados));
            }
        } else {
            setFavoritos([]);
        }
    }, [isLoggedIn]);

    const plantillasFavoritas = plantillasTrabajador.filter(p => favoritos.includes(p.id));
    const plantillasRestantes = plantillasTrabajador.filter(p => !favoritos.includes(p.id));

    const getTarifaAproximada = (trabajador: Trabajador | undefined, cm: number) => {
        if (!trabajador || !trabajador.tarifas || trabajador.tarifas.length === 0) {
            return { cm: 10, minutos: 60, precio: 50 };
        }
        const exacta = trabajador.tarifas.find((t: any) => t.cm === cm);
        if (exacta) return exacta;
        
        const base = trabajador.tarifas[0];
        return {
            cm,
            minutos: (cm / base.cm) * base.minutos,
            precio: (cm / base.cm) * base.precio
        };
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl text-on-surface font-headline uppercase tracking-tight mb-6 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">design_services</span> 2. DETALLES DEL TATUAJE
            </h2>
            <button
                onClick={onBack}
                className="bg-surface-container border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-[0.2em] uppercase text-on-surface hover:text-primary transition-colors mb-8 rounded-sm flex items-center gap-2 group"
            >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_left</span> ATRÁS
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button
                    onClick={() => setFormData({ ...formData, tipo: 'plantilla' })}
                    className={`p-6 border flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 group rounded-sm ${formData.tipo === 'plantilla'
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-outline-variant/30 bg-surface-container/50 hover:border-primary/50'
                        }`}
                >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${formData.tipo === 'plantilla' ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-outline'}`}>
                        <span className="material-symbols-outlined text-3xl text-inherit">local_mall</span>
                    </div>
                    <h3 className="text-lg font-headline tracking-wide uppercase text-on-surface">Diseño del Catálogo</h3>
                    <p className="text-on-surface-variant font-body text-sm text-center">Elige tatuajes o plantillas ya creados por nuestros artistas.</p>
                </button>

                <button
                    onClick={() => setFormData({ ...formData, tipo: 'personalizado' })}
                    className={`p-6 border flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 group rounded-sm ${formData.tipo === 'personalizado'
                        ? 'border-tertiary bg-tertiary/10 scale-[1.02]'
                        : 'border-outline-variant/30 bg-surface-container/50 hover:border-tertiary/50'
                        }`}
                >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${formData.tipo === 'personalizado' ? 'bg-tertiary/20 text-tertiary' : 'bg-surface-container-high text-outline'}`}>
                         <span className="material-symbols-outlined text-3xl text-inherit">draw</span>
                    </div>
                    <h3 className="text-lg font-headline tracking-wide uppercase text-on-surface">Diseño Personalizado</h3>
                    <p className="text-on-surface-variant font-body text-sm text-center">Describe tu idea, danos el tamaño aproximado y sube referencias.</p>
                </button>
            </div>

            <div className="glass-panel p-6 md:p-8 mb-8 relative">
                {formData.tipo === 'plantilla' && (
                    <div className="animate-fade-in">
                        <h3 className="font-label text-xs tracking-[0.2em] uppercase text-outline mb-4">SELECCIONES: {formData.proyectosIDs.length}</h3>

                        {formData.proyectosIDs.length === 0 ? (
                            <p className="text-outline-variant font-body text-sm mb-6">No has seleccionado nada del catálogo.</p>
                        ) : (
                            <div className="flex gap-3 mb-8 flex-wrap">
                                {formData.proyectosIDs.map(id => {
                                    const p = plantillasTrabajador.find(pl => pl.id === id);
                                    return (
                                        <span key={`proj-${id}`} className="bg-primary/20 text-primary px-3 py-1 font-label text-[10px] tracking-widest flex items-center gap-2 border border-primary/50 shadow-sm uppercase rounded-sm">
                                            {p ? (p.tituloTatuaje || p.nombre || `Proyecto #${id}`) : `Proyecto #${id}`}
                                            <button
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    proyectosIDs: formData.proyectosIDs.filter(pid => pid !== id)
                                                })}
                                                className="text-primary hover:text-on-primary hover:bg-primary ml-1 rounded-sm w-4 h-4 flex items-center justify-center transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 border-t border-outline-variant/30 pt-8">
                            {plantillasFavoritas.length > 0 && (
                                <div className="mb-10">
                                    <h4 className="text-tertiary font-headline text-lg uppercase mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[24px]">favorite</span> PROYECTOS FAVORITOS
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {plantillasFavoritas.map(p => {
                                            const isSelected = formData.proyectosIDs.includes(p.id);
                                            return (
                                                <div
                                                    key={`fav-${p.id}`}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setFormData({
                                                                ...formData,
                                                                proyectosIDs: formData.proyectosIDs.filter(pid => pid !== p.id)
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                proyectosIDs: [...formData.proyectosIDs, p.id]
                                                            });
                                                        }
                                                    }}
                                                    className={`relative border aspect-square cursor-pointer transition-all duration-300 rounded-sm overflow-hidden ${isSelected ? 'border-primary ring-2 ring-primary scale-105 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] z-10' : 'border-outline-variant/30 opacity-60 hover:opacity-100 hover:border-primary/50'
                                                        }`}
                                                >
                                                    {p.imagen ? (
                                                        <img src={p.imagen} alt={p.tituloTatuaje || p.nombre} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all" />
                                                    ) : (
                                                        <div className="w-full h-full bg-surface-container flex items-center justify-center font-headline text-2xl text-outline uppercase tracking-widest">NO IMG</div>
                                                    )}
                                                    <div className="absolute inset-x-0 top-0 bg-surface-container-high/80 backdrop-blur-sm border-b border-outline-variant/30 p-1 text-[10px] text-primary font-label uppercase tracking-[0.2em] text-right">
                                                        {(p.tipo || 'PROYECTO').substring(0, 10)}
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 bg-surface-container-high/80 backdrop-blur-sm border-t border-outline-variant/30 p-2 text-center pointer-events-none">
                                                        <span className="text-xs font-headline text-on-surface truncate w-full">{p.tituloTatuaje || p.nombre}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-8 left-2 bg-primary/20 border border-primary text-primary backdrop-blur-sm rounded-full p-1 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <h4 className="text-on-surface font-headline text-lg uppercase mb-6">Catálogo de <span className="text-primary italic">{trabajadores.find(t => t.id === formData.trabajadorId)?.nombre || 'este artista'}</span>:</h4>

                            {plantillasRestantes.length === 0 ? (
                                <p className="text-outline-variant font-body text-sm bg-surface-container p-4 border border-outline-variant/30 rounded-sm">No hay diseños disponibles.</p>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plantillasRestantes.map(p => {
                                        const isSelected = formData.proyectosIDs.includes(p.id);
                                        return (
                                            <div
                                                key={`proj-${p.id}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFormData({
                                                            ...formData,
                                                            proyectosIDs: formData.proyectosIDs.filter(pid => pid !== p.id)
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            proyectosIDs: [...formData.proyectosIDs, p.id]
                                                        });
                                                    }
                                                }}
                                                className={`relative border aspect-square cursor-pointer transition-all duration-300 rounded-sm overflow-hidden ${isSelected ? 'border-primary ring-2 ring-primary scale-105 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] z-10' : 'border-outline-variant/30 opacity-60 hover:opacity-100 hover:border-primary/50'
                                                    }`}
                                            >
                                                {p.imagen ? (
                                                    <img src={p.imagen} alt={p.tituloTatuaje || p.nombre} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <div className="w-full h-full bg-surface-container flex items-center justify-center font-headline text-2xl text-outline uppercase tracking-widest">NO IMG</div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary/25 border-2 border-primary pointer-events-none"></div>
                                                )}
                                                <div className="absolute inset-x-0 top-0 bg-surface-container-high/80 backdrop-blur-sm border-b border-outline-variant/30 p-1 text-[10px] text-primary font-label uppercase tracking-[0.2em] text-right">
                                                    {(p.tipo || 'PROYECTO').substring(0, 10)}
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 bg-surface-container-high/80 backdrop-blur-sm border-t border-outline-variant/30 p-2 text-center pointer-events-none">
                                                    <span className="text-xs font-headline text-on-surface truncate w-full">{p.tituloTatuaje || p.nombre}</span>
                                                </div>
                                                {isSelected && (
                                                    <>
                                                        <div className="absolute top-8 left-2 bg-primary/20 border border-primary text-primary backdrop-blur-sm rounded-full p-1 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                        </div>
                                                        <div className="absolute top-8 right-2 bg-primary text-on-primary font-label text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm">
                                                            Seleccionado
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── SELECCIÓN DE TAMAÑO PARA PLANTILLAS ── */}
                        <div className="mt-12 border-t border-outline-variant/30 pt-8">
                            <label className="block font-label text-xs tracking-[0.2em] uppercase text-outline mb-2">TAMAÑO DESEADO (CM)</label>
                            <p className="text-on-surface-variant font-body text-sm mb-4">Introduce el tamaño al que te gustaría realizar el diseño elegido para calcular el tiempo.</p>
                            <input
                                type="number"
                                className="w-full md:w-1/2 bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-primary transition-colors rounded-sm mb-6"
                                value={formData.tamanoCm}
                                onChange={e => setFormData({ ...formData, tamanoCm: Number(e.target.value) })}
                                min="1"
                            />

                            {formData.trabajadorId && (
                                <div className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col gap-4 w-full md:w-1/2 rounded-sm shadow-sm">
                                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                        <span className="text-outline font-label text-xs tracking-[0.2em] uppercase">TIEMPO APX:</span>
                                        <span className="text-primary font-label text-xs tracking-[0.2em] bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                                            {(() => {
                                                const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                const tiempoMinutos = tarifa.minutos + 15;
                                                const horas = Math.floor(tiempoMinutos / 60);
                                                const minRestantes = Math.round(tiempoMinutos % 60);
                                                if (horas > 0) {
                                                    return `${horas}H ${minRestantes > 0 ? `${minRestantes}m` : ''}`;
                                                }
                                                return `${minRestantes} min`;
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-outline font-label text-xs tracking-[0.2em] uppercase">PRECIO MIN:</span>
                                        <span className="text-on-surface font-headline text-xl">
                                            {(() => {
                                                const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                return tarifa.precio > 0 ? `${Math.round(tarifa.precio).toFixed(2)} €` : 'Consultar';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {formData.tipo === 'personalizado' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Descripción de tu idea</label>
                            <textarea
                                className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-tertiary transition-colors rounded-sm min-h-[150px] resize-y placeholder:text-outline-variant/50"
                                placeholder="Ej: Quiero un león realista estilo blackwork..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Tamaño Aprox. (CM)</label>
                                <input
                                    type="number"
                                    className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-tertiary transition-colors rounded-sm mb-6"
                                    value={formData.tamanoCm}
                                    onChange={e => setFormData({ ...formData, tamanoCm: Number(e.target.value) })}
                                    min="1"
                                />

                                {/* ── ESTIMACIONES DINÁMICAS ── */}
                                {formData.trabajadorId && (
                                    <div className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col gap-4 shadow-sm rounded-sm">
                                        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                            <span className="text-outline font-label text-xs tracking-[0.2em] uppercase">TIEMPO APX:</span>
                                            <span className="text-tertiary font-label text-xs tracking-[0.2em] bg-tertiary/10 px-2 py-1 rounded-sm border border-tertiary/20">
                                                {(() => {
                                                    const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                    const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                    const tiempoMinutos = tarifa.minutos + 15;
                                                    const horas = Math.floor(tiempoMinutos / 60);
                                                    const minRestantes = Math.round(tiempoMinutos % 60);
                                                    if (horas > 0) {
                                                        return `${horas}H ${minRestantes > 0 ? `${minRestantes}m` : ''}`;
                                                    }
                                                    return `${minRestantes} min`;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-outline font-label text-xs tracking-[0.2em] uppercase">PRECIO MIN:</span>
                                            <span className="text-on-surface font-headline text-xl">
                                                {(() => {
                                                    const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                    const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                    return tarifa.precio > 0 ? `${Math.round(tarifa.precio).toFixed(2)} €` : 'Consultar';
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Imagen Referencia</label>
                                <div className="w-full bg-surface-container/50 border border-dashed border-outline-variant/50 p-6 flex items-center justify-center cursor-pointer hover:border-tertiary hover:bg-surface-container-high transition-colors relative min-h-[120px] rounded-sm group/drop">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, imagen: e.target.files ? e.target.files[0] : null })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
                                    />
                                    <div className="text-outline-variant font-label text-xs tracking-[0.2em] uppercase flex flex-col items-center gap-3 transition-colors group-hover/drop:text-tertiary">
                                        <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                                        {formData.imagen ? <span className="text-tertiary underline truncate max-w-[200px]">{formData.imagen.name}</span> : 'HAZ CLICK O ARRASTRA'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!formData.tipo && (
                    <p className="text-center font-body text-sm text-outline-variant bg-surface-container/50 border border-outline-variant/30 p-6 rounded-sm">Selecciona una variante (Catálogo o Personalizado) arriba para continuar.</p>
                )}
            </div>

            <button
                onClick={onNext}
                disabled={!formData.tipo || (formData.tipo === 'personalizado' && (!formData.descripcion))}
                className="w-full p-4 primary-gradient-cta font-label text-sm tracking-[0.2em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2 mt-8 transition-all"
            >
                CONTINUAR A FECHA Y HORA <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
    );
}
