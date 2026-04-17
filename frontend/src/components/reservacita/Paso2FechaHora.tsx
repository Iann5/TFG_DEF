
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
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl text-on-surface font-headline uppercase tracking-tight mb-6 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span> 3. ELIGE DÍA Y HORA
            </h2>
            <button
                onClick={onBack}
                className="bg-surface-container border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-[0.2em] uppercase text-on-surface hover:text-primary transition-colors mb-8 rounded-sm flex items-center gap-2 group"
            >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_left</span> VOLVER A DETALLES
            </button>

            <div className="glass-panel p-6 md:p-8 mb-8 relative">
                <div className="space-y-4 relative group flex flex-col items-start block overflow-visible mt-2">
                    <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Selecciona un día</label>
                    <div className="relative w-full md:w-1/2">
                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors z-10">calendar_today</span>
                        <input
                            type="date"
                            className="w-full bg-surface-container/50 border border-outline-variant/30 pl-10 pr-3 py-3 text-on-surface font-body text-base outline-none focus:border-primary transition-colors cursor-pointer rounded-sm"
                            value={formData.fecha}
                            onChange={onFechaChange}
                            min={new Date().toISOString().split('T')[0]}
                            style={{colorScheme: 'dark'}}
                        />
                    </div>
                </div>

                {formData.fecha && horasDisponibles.length > 0 && (
                    <div className="animate-fade-in border-t border-outline-variant/30 pt-8 mt-8">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-[16px]">schedule</span> Horas disponibles
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {horasDisponibles.map(slot => (
                                <button
                                    key={slot.hora}
                                    onClick={() => {
                                        if (!slot.disponible) {
                                            if (slot.motivo === 'superaLimite') {
                                                alert(`La franja de las ${slot.hora} no está disponible porque tu diseño requiere demasiado tiempo y se solaparía con la siguiente cita.`);
                                            } else {
                                                alert(`La franja de las ${slot.hora} no está disponible porque el tatuador ya tiene una cita ocupando ese hueco.`);
                                            }
                                        } else {
                                            onHoraSelect(slot.hora);
                                        }
                                    }}
                                    className={`relative p-3 rounded-sm border transition-all ${!slot.disponible
                                            ? slot.motivo === 'superaLimite'
                                                ? 'bg-surface-container/50 border-error/30 text-on-surface/30 cursor-not-allowed'
                                                : 'bg-surface-container/50 border-error/30 text-on-surface/30 cursor-not-allowed'
                                            : formData.horaInicio === slot.hora
                                                ? 'bg-primary/20 border-primary text-primary shadow-sm transform scale-105 z-10'
                                                : 'bg-surface-container/50 border-outline-variant/30 text-on-surface hover:border-primary/50 hover:text-primary hover:-translate-y-1'
                                        } flex flex-col items-center justify-center min-h-[70px]`}
                                >
                                    <div className="flex flex-col items-center justify-center w-full gap-2 relative">
                                        <span className={`font-headline text-lg tracking-wider leading-none ${!slot.disponible ? 'line-through opacity-50' : ''}`}>
                                            {slot.hora}
                                        </span>
                                        {!slot.disponible && (
                                            <div className={`absolute inset-0 flex items-center justify-center`}>
                                                <span className={`font-label text-[10px] px-2 py-1 uppercase tracking-widest transform -rotate-[15deg] border rounded-sm backdrop-blur-sm ${slot.motivo === 'superaLimite' ? 'bg-error/20 border-error text-error' : 'bg-error/20 border-error text-error'}`}>
                                                    {slot.motivo === 'superaLimite' ? 'No Tiempo' : 'Ocupado'}
                                                </span>
                                            </div>
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
