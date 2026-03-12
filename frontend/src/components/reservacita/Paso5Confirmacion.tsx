import { ShieldCheck } from 'lucide-react';
import PDFSigner from '../../components/PDFSigner';
import type { FirmasState, CitaForm, Trabajador } from '../../types/Citas';

interface Props {
    isSubmitting: boolean;
    firmas: FirmasState | null;
    formData: CitaForm;
    trabajador: Trabajador | null;
    onBack: () => void;
    onSignComplete: (sigs: FirmasState) => void;
    onSubmit: () => void;
}

export default function Paso5Confirmacion({
    isSubmitting,
    firmas,
    formData,
    trabajador,
    onBack,
    onSignComplete,
    onSubmit
}: Props) {
    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <h2 className="text-xl text-sky-400 font-bold mb-6 flex items-center gap-2">
                <ShieldCheck size={24} /> 5. Firma y Confirmación
            </h2>
            <button
                onClick={onBack}
                className="text-white/60 hover:text-white underline text-sm mb-6 inline-block"
            >
                &larr; Atrás
            </button>

            <PDFSigner
                formData={formData}
                trabajador={trabajador}
                onSignComplete={onSignComplete}
            />

            <button
                onClick={onSubmit}
                disabled={!firmas?.responsabilidad || isSubmitting}
                className="w-full mt-8 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-xl transition shadow-lg shadow-green-900/40 flex items-center justify-center gap-2"
            >
                {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
        </div>
    );
}
