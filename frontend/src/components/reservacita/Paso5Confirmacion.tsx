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
    const necesitaPrivacidad = formData.tipo === 'personalizado';
    const puedeConfirmar =
        Boolean(firmas?.compromisoEntregar) &&
        Boolean(firmas?.descargadoResponsabilidad) &&
        (necesitaPrivacidad ? Boolean(firmas?.descargadoPrivacidad) : true);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl text-on-surface font-headline uppercase tracking-tight mb-6 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span> 5. FIRMA Y CONFIRMACIÓN
            </h2>
            <button
                onClick={onBack}
                className="bg-surface-container border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-[0.2em] uppercase text-on-surface hover:text-primary transition-colors mb-8 rounded-sm flex items-center gap-2 group"
            >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_left</span> ATRÁS
            </button>

            <div className="glass-panel p-6 md:p-8 mb-8">
                <PDFSigner
                    formData={formData}
                    trabajador={trabajador}
                    onSignComplete={onSignComplete}
                />
            </div>

            <button
                onClick={onSubmit}
                disabled={!puedeConfirmar || isSubmitting}
                className="w-full p-4 primary-gradient-cta font-label text-sm tracking-[0.2em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group mt-8 transition-all"
            >
                {isSubmitting ? (
                    <>
                         <span className="material-symbols-outlined text-[16px] animate-spin">data_saver_on</span> PROCESANDO...
                    </>
                ) : (
                    <>
                        CONFIRMAR RESERVA <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">send</span>
                    </>
                )}
            </button>
        </div>
    );
}
