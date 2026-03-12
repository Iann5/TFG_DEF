import { FileText } from 'lucide-react';
import type { CitaForm } from '../../types/Citas';

interface Props {
    formData: CitaForm;
    setFormData: (data: CitaForm) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Paso3DatosPersonales({ formData, setFormData, onBack, onNext }: Props) {
    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <h2 className="text-xl text-sky-400 font-bold mb-6 flex items-center gap-2">
                <FileText size={24} /> 3. Datos Personales
            </h2>
            <button
                onClick={onBack}
                className="text-white/60 hover:text-white underline text-sm mb-6 inline-block"
            >
                &larr; Atrás
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-white/70 text-sm font-bold mb-1">Nombre</label>
                    <input type="text" className="w-full bg-[#1C1B28] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500"
                        value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                </div>
                <div>
                    <label className="block text-white/70 text-sm font-bold mb-1">Apellidos</label>
                    <input type="text" className="w-full bg-[#1C1B28] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500"
                        value={formData.apellidos} onChange={e => setFormData({ ...formData, apellidos: e.target.value })} />
                </div>
                <div>
                    <label className="block text-white/70 text-sm font-bold mb-1">DNI</label>
                    <input type="text" className="w-full bg-[#1C1B28] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500"
                        value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                </div>
                <div>
                    <label className="block text-white/70 text-sm font-bold mb-1">Teléfono</label>
                    <input type="tel" className="w-full bg-[#1C1B28] text-white border border-white/20 p-3 rounded-xl outline-none focus:border-sky-500"
                        value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!formData.nombre || !formData.apellidos || !formData.dni || !formData.telefono}
                className="w-full mt-8 py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-xl transition"
            >
                Siguiente Paso &rarr;
            </button>
        </div>
    );
}
