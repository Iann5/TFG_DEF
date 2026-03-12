import { Calendar, Clock } from 'lucide-react';
import type { CitaForm, SlotHora } from '../../types/Citas';

interface Props {
    formData: CitaForm;
    horasDisponibles: SlotHora[];
    onBack: () => void;
    onFechaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onHoraSelect: (hora: string) => void;
}

export default function Paso2FechaHora({ formData, horasDisponibles, onBack, onFechaChange, onHoraSelect }: Props) {
    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <h2 className="text-xl text-sky-400 font-bold mb-6 flex items-center gap-2">
                <Calendar size={24} /> 3. Elige Día y Hora
            </h2>
            <button
                onClick={onBack}
                className="text-white/60 hover:text-white underline text-sm mb-6 inline-block"
            >
                &larr; Volver a Detalles
            </button>

            <div className="bg-[#1C1B28] p-6 rounded-2xl border border-white/10">
                <label className="block text-white/70 font-bold mb-2">Selecciona un día:</label>
                <input
                    type="date"
                    className="w-full bg-[#323444] text-white border border-white/20 p-3 rounded-xl mb-6 outline-none focus:border-sky-500"
                    value={formData.fecha}
                    onChange={onFechaChange}
                    min={new Date().toISOString().split('T')[0]}
                />

                {formData.fecha && horasDisponibles.length > 0 && (
                    <div>
                        <label className="block text-white/70 font-bold mb-4">Horas disponibles:</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {horasDisponibles.map(slot => (
                                <button
                                    key={slot.hora}
                                    onClick={() => {
                                        if (!slot.disponible) {
                                            alert(`La franja de las ${slot.hora} no está disponible porque el tatuador está ocupado en ese momento con el tiempo que requiere tu tatuaje.`);
                                        } else {
                                            onHoraSelect(slot.hora);
                                        }
                                    }}
                                    className={`p-3 rounded-xl font-bold transition-all border outline-none ${!slot.disponible
                                            ? 'bg-red-900/10 border-red-900/30 text-red-400/50 cursor-not-allowed hover:bg-red-900/20'
                                            : formData.horaInicio === slot.hora
                                                ? 'bg-sky-600 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] transform scale-105'
                                                : 'bg-[#323444] border-white/10 text-white/80 hover:bg-[#3b3d52] hover:text-white hover:-translate-y-0.5'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        <Clock size={16} className={!slot.disponible ? 'opacity-50' : ''} />
                                        <span className={!slot.disponible ? 'line-through decoration-red-500/50' : ''}>{slot.hora}</span>
                                        {!slot.disponible && (
                                            <span className="text-[9px] uppercase tracking-wider text-red-400/70 mt-0.5">Ocupado</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
