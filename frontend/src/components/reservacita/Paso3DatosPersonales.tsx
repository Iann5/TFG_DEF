
import type { CitaForm } from '../../types/Citas';

interface Props {
    formData: CitaForm;
    setFormData: (data: CitaForm) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Paso3DatosPersonales({ formData, setFormData, onBack, onNext }: Props) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl text-on-surface font-headline uppercase tracking-tight mb-6 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">badge</span> 4. DATOS PERSONALES
            </h2>
            <button
                onClick={onBack}
                className="bg-surface-container border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-[0.2em] uppercase text-on-surface hover:text-primary transition-colors mb-8 rounded-sm flex items-center gap-2 group"
            >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_left</span> ATRÁS
            </button>

            <div className="glass-panel p-6 md:p-8 mb-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Nombre</label>
                        <input type="text" className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-primary transition-colors rounded-sm text-on-surface placeholder:text-outline-variant/50"
                            value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                    </div>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Apellidos</label>
                        <input type="text" className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-primary transition-colors rounded-sm text-on-surface placeholder:text-outline-variant/50"
                            value={formData.apellidos} onChange={e => setFormData({ ...formData, apellidos: e.target.value })} />
                    </div>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">DNI</label>
                        <input type="text" className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-primary transition-colors rounded-sm text-on-surface uppercase placeholder:text-outline-variant/50"
                            value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                    </div>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">Teléfono</label>
                        <input type="tel" className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface font-body text-base p-3 outline-none focus:border-primary transition-colors rounded-sm text-on-surface placeholder:text-outline-variant/50"
                            value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!formData.nombre || !formData.apellidos || !formData.dni || !formData.telefono}
                className="w-full p-4 primary-gradient-cta font-label text-sm tracking-[0.2em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2 mt-8 transition-all"
            >
                PASO FINAL: FIRMAS <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
    );
}
