import { CheckCircle, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import type { CitaForm, Trabajador } from '../../types/Citas';
import type { RawProyecto } from '../../types/proyecto';
import type { PackDetalle } from '../../types/Pack';

interface Props {
    formData: CitaForm;
    setFormData: (data: CitaForm) => void;
    trabajadores: Trabajador[];
    plantillasTrabajador: RawProyecto[];
    packsTrabajador: PackDetalle[];
    onBack: () => void;
    onNext: () => void;
}

export default function Paso4DetallesTatuaje({
    formData,
    setFormData,
    trabajadores,
    plantillasTrabajador,
    packsTrabajador,
    onBack,
    onNext
}: Props) {

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
        <div className="animate-fade-in w-full max-w-3xl mx-auto">
            <h2 className="text-xl text-sky-400 font-bold mb-6 flex items-center gap-2">
                <ImageIcon size={24} /> 2. Detalles del Tatuaje
            </h2>
            <button
                onClick={onBack}
                className="text-white/60 hover:text-white underline text-sm mb-6 inline-block"
            >
                &larr; Atrás
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 mb-8">
                <button
                    onClick={() => setFormData({ ...formData, tipo: 'plantilla' })}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${formData.tipo === 'plantilla'
                        ? 'border-sky-500 bg-sky-900/30'
                        : 'border-white/10 bg-[#1C1B28] hover:border-white/30'
                        }`}
                >
                    <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Diseño del Catálogo</h3>
                    <p className="text-white/60 text-sm text-center">Elige tatuajes, plantillas o packs ya creados por nuestros artistas.</p>
                </button>

                <button
                    onClick={() => setFormData({ ...formData, tipo: 'personalizado' })}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${formData.tipo === 'personalizado'
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-white/10 bg-[#1C1B28] hover:border-white/30'
                        }`}
                >
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Diseño Personalizado</h3>
                    <p className="text-white/60 text-sm text-center">Describe tu idea, danos el tamaño aproximado y sube referencias.</p>
                </button>
            </div>

            <div className="bg-[#1C1B28] p-6 rounded-2xl border border-white/10 mb-8">
                {formData.tipo === 'plantilla' && (
                    <div className="animate-fade-in">
                        <h3 className="font-bold text-lg text-white mb-4">Selecciones: {formData.proyectosIDs.length + formData.packsIDs.length}</h3>

                        {(formData.proyectosIDs.length === 0 && formData.packsIDs.length === 0) ? (
                            <p className="text-white/50 text-sm mb-4">No has seleccionado nada del catálogo.</p>
                        ) : (
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {formData.proyectosIDs.map(id => {
                                    const p = plantillasTrabajador.find(pl => pl.id === id);
                                    return (
                                        <span key={`proj-${id}`} className="bg-sky-900/40 text-sky-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-sky-500/30">
                                            {p ? (p.tituloTatuaje || p.nombre || `Proyecto #${id}`) : `Proyecto #${id}`}
                                            <button
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    proyectosIDs: formData.proyectosIDs.filter(pid => pid !== id)
                                                })}
                                                className="text-white/50 hover:text-red-400 ml-1 bg-black/20 rounded-full w-5 h-5 flex items-center justify-center transition-colors hover:bg-red-500/20"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    );
                                })}
                                {formData.packsIDs.map(id => {
                                    const p = packsTrabajador.find(pl => pl.id === id);
                                    return (
                                        <span key={`pack-${id}`} className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-purple-500/30">
                                            [Pack] {p ? (p.titulo || `Pack #${id}`) : `Pack #${id}`}
                                            <button
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    packsIDs: formData.packsIDs.filter(pid => pid !== id)
                                                })}
                                                className="text-purple-300/50 hover:text-red-400 ml-1 bg-black/20 rounded-full w-5 h-5 flex items-center justify-center transition-colors hover:bg-red-500/20"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 border-t border-white/10 pt-6">
                            <h4 className="text-white font-bold mb-4">Catálogo de {trabajadores.find(t => t.id === formData.trabajadorId)?.nombre || 'este artista'}:</h4>

                            {plantillasTrabajador.length === 0 && packsTrabajador.length === 0 ? (
                                <p className="text-white/40 text-sm">No hay diseños o packs disponibles.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {plantillasTrabajador.map(p => {
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
                                                className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer border-2 transition-all ${isSelected ? 'border-sky-500 scale-[0.98] shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'border-transparent hover:border-white/20'
                                                    }`}
                                            >
                                                {p.imagen ? (
                                                    <img src={p.imagen} alt={p.tituloTatuaje || p.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white/50">Sin Imagen</div>
                                                )}
                                                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-2 text-xs text-sky-300 font-bold uppercase tracking-wider text-right">
                                                    {(p.tipo || 'Proyecto').substring(0, 10)}
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 pointer-events-none">
                                                    <span className="text-xs font-bold text-white truncate w-full">{p.tituloTatuaje || p.nombre}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 left-2 bg-sky-500 text-white rounded-full p-1 shadow-lg">
                                                        <CheckCircle size={14} className="fill-white text-sky-500" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {packsTrabajador.map(p => {
                                        const isSelected = formData.packsIDs.includes(p.id);
                                        return (
                                            <div
                                                key={`pack-${p.id}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFormData({
                                                            ...formData,
                                                            packsIDs: formData.packsIDs.filter(pid => pid !== p.id)
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            packsIDs: [...formData.packsIDs, p.id]
                                                        });
                                                    }
                                                }}
                                                className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer border-2 transition-all ${isSelected ? 'border-purple-500 scale-[0.98] shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-transparent hover:border-white/20'
                                                    }`}
                                            >
                                                {p.imagen ? (
                                                    <img src={p.imagen} alt={p.titulo} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white/50">Sin Imagen</div>
                                                )}
                                                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-2 text-xs font-black uppercase tracking-wider text-right text-purple-400">
                                                    PACK
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 pointer-events-none">
                                                    <span className="text-xs font-bold text-white truncate w-full">{p.titulo}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 left-2 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                                                        <CheckCircle size={14} className="fill-white text-purple-500" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {formData.tipo === 'personalizado' && (
                    <div className="animate-fade-in space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm font-bold mb-1">Descripción de tu idea</label>
                            <textarea
                                className="w-full bg-[#323444] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500 min-h-[100px]"
                                placeholder="Ej: Quiero un león realista estilo blackwork..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-white/70 text-sm font-bold mb-1">Tamaño aprox. (cm)</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#323444] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500 mb-4"
                                    value={formData.tamanoCm}
                                    onChange={e => setFormData({ ...formData, tamanoCm: Number(e.target.value) })}
                                    min="1"
                                />

                                {/* ── ESTIMACIONES DINÁMICAS ── */}
                                {formData.trabajadorId && (
                                    <div className="bg-[#1C1B28] rounded-xl border border-sky-500/30 p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/60 text-sm">Tiempo Estimado:</span>
                                            <span className="text-sky-400 font-bold">
                                                {(() => {
                                                    const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                    const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                    const tiempoMinutos = tarifa.minutos + 15;
                                                    const horas = Math.floor(tiempoMinutos / 60);
                                                    const minRestantes = Math.round(tiempoMinutos % 60);
                                                    if (horas > 0) {
                                                        return `${horas}h ${minRestantes > 0 ? `${minRestantes}m` : ''}`;
                                                    }
                                                    return `${minRestantes} min`;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/60 text-sm">Precio Mínimo Aprox:</span>
                                            <span className="text-green-400 font-bold text-lg">
                                                {(() => {
                                                    const trabajador = trabajadores.find(t => t.id === formData.trabajadorId);
                                                    const tarifa = getTarifaAproximada(trabajador, formData.tamanoCm);
                                                    return tarifa.precio > 0 ? `${Math.round(tarifa.precio).toFixed(2)} €` : 'A consultar';
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-white/70 text-sm font-bold mb-1">Imagen de Referencia</label>
                                <div className="w-full bg-[#323444] border-2 border-dashed border-white/20 rounded-xl p-3 flex justify-center cursor-pointer hover:border-sky-500 transition relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, imagen: e.target.files ? e.target.files[0] : null })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    />
                                    <span className="text-white/50 text-sm flex items-center gap-2">
                                        <Upload size={16} /> {formData.imagen ? formData.imagen.name : 'Subir Imagen'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!formData.tipo && (
                    <p className="text-center text-white/50 text-sm py-4">Selecciona una opción arriba para continuar.</p>
                )}
            </div>

            <button
                onClick={onNext}
                disabled={!formData.tipo || (formData.tipo === 'personalizado' && (!formData.descripcion))}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-xl transition"
            >
                Continuar a Fecha y Hora &rarr;
            </button>
        </div >
    );
}
