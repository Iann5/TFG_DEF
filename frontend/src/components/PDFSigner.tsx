import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import { type PDFSignerProps } from '../types/FirmaPDF';

export default function PDFSigner({ formData, trabajador, onSignComplete }: PDFSignerProps) {
    const sigResponsabilidadRef = useRef<SignatureCanvas>(null);
    const sigPrivacidadRef = useRef<SignatureCanvas>(null);
    const [responsabilidadFirmado, setResponsabilidadFirmado] = useState<boolean>(false);
    const [privacidadFirmado, setPrivacidadFirmado] = useState<boolean>(false);
    const [pdfsDescargados, setPdfsDescargados] = useState({ resp: false, priv: false });
    const [compromisoEntregar, setCompromisoEntregar] = useState(false);

    const [prevResponsabilidad, setPrevResponsabilidad] = useState<string>('');
    const [prevPrivacidad, setPrevPrivacidad] = useState<string>('');

    const necesitaPrivacidad = formData.tipo === 'personalizado';

    // Generadores base de PDF
    const crearDocResponsabilidad = (firmaBase64?: string) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('DOCUMENTO DE RESPONSABILIDAD DE TATUAJE', 20, 20);

        doc.setFontSize(10);
        const textoLegales = [
            "Por medio del presente documento, el cliente anteriormente identificado declara bajo protesta de decir verdad que es mayor de edad, que cuenta con plena capacidad legal para contratar y obligarse, y que se encuentra en plenas facultades mentales y físicas, actuando de manera libre, consciente y voluntaria, sin que medie error, dolor, violencia o cualquier otro vicio del consentimiento.",
            "",
            "Asimismo, manifiesta que ha sido debidamente informado(a) sobre la naturaleza del procedimiento de tatuaje, sus características, posibles molestias, riesgos inherentes, cuidados previos y posteriores, así como sobre el proceso de cicatrización. Declara haber tenido la oportunidad de formular todas las preguntas que consideró necesarias y que estas han sido respondidas satisfactoriamente, comprendiendo en su totalidad la información proporcionada.",
            "",
            "El cliente afirma que ha informado de manera veraz y completa sobre cualquier condición médica relevante, incluyendo, pero no limitándose a: alergias, enfermedades cutáneas, trastornos de coagulación, diabetes, epilepsia, embarazo, uso de medicamentos, consumo de alcohol o sustancias, o cualquier otra circunstancia que pudiera afectar el procedimiento o el proceso de cicatrización.",
            "",
            "En consecuencia, el cliente acepta someterse al procedimiento de tatuaje bajo su propia responsabilidad y exime expresamente al artista y al establecimiento de cualquier responsabilidad civil, penal o administrativa derivada de:",
            "",
            "  - Alergias, reacciones adversas o complicaciones ocasionadas por información médica omitida o no declarada.",
            "  - Infecciones o complicaciones derivadas del incumplimiento de las instrucciones de cuidado posterior proporcionadas.",
            "  - Alteraciones en el resultado final del tatuaje ocasionadas por factores propios del organismo del cliente, tipo de piel, proceso de cicatrización o cuidados inadecuados.",
            "  - Cualquier consecuencia derivada de la manipulación, exposición indebida o negligencia en el cuidado del área tatuada.",
            "",
            "El cliente reconoce que el tatuaje es un procedimiento permanente en la piel y que, si bien pueden existir métodos de eliminación o modificación, estos pueden implicar costos adicionales, múltiples sesiones y resultados variables. Leído que fue el presente documento, el cliente manifiesta su conformidad con su contenido y lo firma para constancia, aceptando íntegramente sus términos y condiciones."
        ].join('\n');

        const textLines = doc.splitTextToSize(textoLegales, 170);
        doc.text(textLines, 20, 95);

        doc.setFontSize(12);
        doc.text(`Fecha de Cita: ${formData.fecha} a las ${formData.horaInicio}`, 20, 35);
        doc.text(`Cliente: ${formData.nombre} ${formData.apellidos}`, 20, 45);
        doc.text(`DNI: ${formData.dni}`, 20, 55);
        doc.text(`Teléfono: ${formData.telefono}`, 20, 65);
        doc.text(`Artista: ${trabajador?.nombre || 'El Artista'}`, 20, 75);

        const finalY = 95 + (textLines.length * 4.5); // Posición dinámica debajo del texto

        if (firmaBase64) {
            doc.setFontSize(12);
            doc.text('Firma del Cliente:', 20, finalY + 10);
            doc.addImage(firmaBase64, 'PNG', 20, finalY + 15, 60, 30);
        }

        return doc;
    };

    const crearDocPrivacidad = (firmaBase64?: string) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('DOCUMENTO DE PRIVACIDAD DE DATOS Y DISEÑO', 20, 20);

        doc.setFontSize(12);
        doc.text(`Cliente: ${formData.nombre} ${formData.apellidos}`, 20, 35);
        doc.text(`DNI: ${formData.dni}`, 20, 45);

        doc.setFontSize(10);
        const textoPriv = [
            "El cliente autoriza el tratamiento de sus datos personales e imágenes/referencias aportadas para la creación del diseño personalizado.",
            "",
            "El artista se compromete a no distribuir estas referencias sin consentimiento. El diseño final resultante es una obra original del artista y se aplicarán los derechos de autoría correspondientes."
        ].join('\n');

        const textLinesPriv = doc.splitTextToSize(textoPriv, 170);
        doc.text(textLinesPriv, 20, 65);

        const finalYPriv = 65 + (textLinesPriv.length * 4.5);

        if (firmaBase64) {
            doc.setFontSize(12);
            doc.text('Firma del Cliente:', 20, finalYPriv + 15);
            doc.addImage(firmaBase64, 'PNG', 20, finalYPriv + 20, 60, 30);
        }

        return doc;
    };

    // Actualizar previsualizaciones iniciales
    useEffect(() => {
        const docResp = crearDocResponsabilidad();
        const urlResp = URL.createObjectURL(docResp.output('blob'));
        setPrevResponsabilidad(urlResp);

        let urlPriv: string | undefined;
        if (necesitaPrivacidad) {
            const docPriv = crearDocPrivacidad();
            urlPriv = URL.createObjectURL(docPriv.output('blob'));
            setPrevPrivacidad(urlPriv);
        }

        return () => {
            URL.revokeObjectURL(urlResp);
            if (urlPriv) URL.revokeObjectURL(urlPriv);
        };
    }, [formData, trabajador, necesitaPrivacidad]);

    // Limpiar firmas
    const clearResponsabilidad = () => {
        sigResponsabilidadRef.current?.clear();
        setResponsabilidadFirmado(false);
    };

    const clearPrivacidad = () => {
        sigPrivacidadRef.current?.clear();
        setPrivacidadFirmado(false);
    };

    const handleEndResponsabilidad = () => {
        setResponsabilidadFirmado(!(sigResponsabilidadRef.current?.isEmpty() ?? true));
    };

    const handleEndPrivacidad = () => {
        setPrivacidadFirmado(!(sigPrivacidadRef.current?.isEmpty() ?? true));
    };

    // Descargas
    const manejarDescargaGenerica = (doc: jsPDF, nombre: string, tipo: 'resp' | 'priv') => {
        doc.save(`${nombre}_${formData.nombre}_${formData.fecha}.pdf`);
        setPdfsDescargados(prev => ({ ...prev, [tipo]: true }));
    };

    const descargarResponsabilidadPDF = () => {
        const canvas = sigResponsabilidadRef.current;
        const tieneFirma = canvas ? !canvas.isEmpty() : false;

        try {
            const sig = (tieneFirma && canvas) ? canvas.getCanvas().toDataURL('image/png') : undefined;
            const doc = crearDocResponsabilidad(sig);
            manejarDescargaGenerica(doc, tieneFirma ? 'Responsabilidad' : 'Responsabilidad_Borrador', 'resp');
        } catch (error) {
            console.error("Error al generar el PDF de Responsabilidad:", error);
            alert("No se pudo generar el PDF.");
        }
    };

    const descargarPrivacidadPDF = () => {
        const canvas = sigPrivacidadRef.current;
        const tieneFirma = canvas ? !canvas.isEmpty() : false;

        try {
            const sig = (tieneFirma && canvas) ? canvas.getCanvas().toDataURL('image/png') : undefined;
            const doc = crearDocPrivacidad(sig);
            manejarDescargaGenerica(doc, tieneFirma ? 'Privacidad' : 'Privacidad_Borrador', 'priv');
        } catch (error) {
            console.error("Error al generar el PDF de Privacidad:", error);
            alert("No se pudo generar el PDF.");
        }
    };

    // Callback para que ReservarCita tenga firmas (opcionales)
    useEffect(() => {
        const canvasResp = sigResponsabilidadRef.current;
        const canvasPriv = sigPrivacidadRef.current;

        const respSig = (canvasResp && !canvasResp.isEmpty()) ? canvasResp.getCanvas().toDataURL('image/png') : undefined;
        const privSig = (necesitaPrivacidad && canvasPriv && !canvasPriv.isEmpty()) ? canvasPriv.getCanvas().toDataURL('image/png') : undefined;

        onSignComplete({
            responsabilidad: respSig,
            ...(necesitaPrivacidad ? { privacidad: privSig } : {}),
            descargadoResponsabilidad: pdfsDescargados.resp,
            ...(necesitaPrivacidad ? { descargadoPrivacidad: pdfsDescargados.priv } : {}),
            compromisoEntregar: compromisoEntregar
        });
    }, [responsabilidadFirmado, privacidadFirmado, compromisoEntregar, necesitaPrivacidad, pdfsDescargados.resp, pdfsDescargados.priv]);

    return (
        <div className="space-y-8 animate-fade-in w-full text-left">
            {/* Caja de Responsabilidad */}
            <div className="bg-surface-container/50 p-6 md:p-8 border border-outline-variant/30 rounded-sm flex flex-col gap-6 relative group">
                <h3 className="font-headline text-xl text-primary uppercase border-b border-primary/30 inline-block pb-2 self-start flex items-center gap-2">
                    <span className="material-symbols-outlined shrink-0 text-2xl">history_edu</span> 1. ACUERDO DE RESPONSABILIDAD
                </h3>
                <p className="text-on-surface-variant font-body text-sm">
                    Puedes descargar el PDF en cualquier momento. Si firmas, la firma se incluirá en el documento (opcional).
                </p>

                {/* Previsualización del PDF */}
                {prevResponsabilidad && (
                    <div className="w-full h-64 border border-outline-variant/30 overflow-hidden relative rounded-sm">
                        <iframe
                            src={`${prevResponsabilidad}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full filter grayscale hover:grayscale-0 transition-all duration-300"
                            title="Previsualización Responsabilidad"
                        />
                    </div>
                )}

                <div className="bg-surface-container-high border border-primary/50 p-1 relative rounded-sm shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                    <p className="text-primary font-label text-[10px] px-4 pt-2 text-center uppercase tracking-widest absolute top-0 inset-x-0 pointer-events-none opacity-50">DIBUJA TU FIRMA AQUÍ</p>
                    <SignatureCanvas
                        ref={sigResponsabilidadRef}
                        canvasProps={{ width: 500, height: 150, className: 'w-full h-[150px] cursor-crosshair touch-none relative z-10' }}
                        onEnd={handleEndResponsabilidad}
                    />
                </div>

                <div className="flex justify-between items-center sm:flex-row flex-col gap-6 pt-4 border-t border-outline-variant/30">
                    <button onClick={clearResponsabilidad} className="text-error hover:text-error/80 font-label text-xs tracking-[0.2em] flex items-center gap-2 transition-colors uppercase">
                        <span className="material-symbols-outlined text-[16px]">refresh</span> BORRAR LIENZO
                    </button>

                    <button
                        type="button"
                        onClick={descargarResponsabilidadPDF}
                        className={`px-6 py-3 font-label text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-transform uppercase rounded-sm border ${
                            responsabilidadFirmado
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary),0.2)] hover:-translate-y-1'
                                : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/50 hover:-translate-y-1'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{pdfsDescargados.resp ? 'download_done' : 'download'}</span>
                        {pdfsDescargados.resp ? '¡DESCARGADO!' : 'DESCARGAR PDF'}
                    </button>
                </div>
            </div>

            {/* Caja de Privacidad */}
            {necesitaPrivacidad && (
                <div className="bg-surface-container/50 p-6 md:p-8 border border-outline-variant/30 rounded-sm flex flex-col gap-6 relative group">
                    <h3 className="font-headline text-xl text-tertiary uppercase border-b border-tertiary/30 inline-block pb-2 self-start flex items-center gap-2">
                         <span className="material-symbols-outlined shrink-0 text-2xl">privacy_tip</span> 2. PRIVACIDAD DE DATOS Y DISEÑO
                    </h3>
                    <p className="text-on-surface-variant font-body text-sm">
                        Puedes descargar el PDF en cualquier momento. Si firmas, la firma se incluirá en el documento (opcional).
                    </p>

                    {/* Previsualización del PDF */}
                    {prevPrivacidad && (
                        <div className="w-full h-64 border border-outline-variant/30 overflow-hidden relative rounded-sm">
                            <iframe
                                src={`${prevPrivacidad}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full filter grayscale hover:grayscale-0 transition-all duration-300"
                                title="Previsualización Privacidad"
                            />
                        </div>
                    )}

                    <div className="bg-surface-container-high border border-tertiary/50 p-1 relative rounded-sm shadow-[0_0_15px_rgba(var(--color-tertiary),0.1)]">
                        <p className="text-tertiary font-label text-[10px] px-4 pt-2 text-center uppercase tracking-widest absolute top-0 inset-x-0 pointer-events-none opacity-50">DIBUJA TU FIRMA AQUÍ</p>
                        <SignatureCanvas
                            ref={sigPrivacidadRef}
                            canvasProps={{ width: 500, height: 150, className: 'w-full h-[150px] cursor-crosshair touch-none relative z-10' }}
                            onEnd={handleEndPrivacidad}
                        />
                    </div>

                    <div className="flex justify-between items-center sm:flex-row flex-col gap-6 pt-4 border-t border-outline-variant/30">
                        <button onClick={clearPrivacidad} className="text-error hover:text-error/80 font-label text-xs tracking-[0.2em] flex items-center gap-2 transition-colors uppercase">
                             <span className="material-symbols-outlined text-[16px]">refresh</span> BORRAR LIENZO
                        </button>

                        <button
                            type="button"
                            onClick={descargarPrivacidadPDF}
                            className={`px-6 py-3 font-label text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-transform uppercase rounded-sm border ${
                                privacidadFirmado
                                    ? 'bg-tertiary/10 border-tertiary text-tertiary shadow-[0_0_10px_rgba(var(--color-tertiary),0.2)] hover:-translate-y-1'
                                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/50 hover:-translate-y-1'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{pdfsDescargados.priv ? 'download_done' : 'download'}</span>
                            {pdfsDescargados.priv ? '¡DESCARGADO!' : 'DESCARGAR PDF'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-primary/5 border border-primary/30 p-6 rounded-sm shadow-sm overflow-hidden relative group">
                <label className="flex items-start gap-4 cursor-pointer relative z-10">
                    <div className="relative flex items-center justify-center shrink-0 mt-1">
                        <input
                            type="checkbox"
                            checked={compromisoEntregar}
                            onChange={(e) => setCompromisoEntregar(e.target.checked)}
                            className="peer appearance-none w-6 h-6 border border-outline-variant/50 bg-surface-container checked:bg-primary checked:border-primary transition-colors cursor-pointer rounded-sm"
                        />
                        <span className="material-symbols-outlined absolute text-on-primary text-[18px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                    </div>
                    <span className="text-on-surface font-body text-sm tracking-wide leading-relaxed inline-block group-hover:text-primary transition-colors">
                        Me comprometo a descargar, imprimir y entregar este(os) documento(s) firmado(s) al tatuador el día de la cita. <br/> <strong className="text-primary font-label text-[10px] tracking-widest uppercase bg-primary/10 px-2 mt-2 inline-block border border-primary/20">ENTIENDO QUE ES UN REQUISITO OBLIGATORIO.</strong>
                    </span>
                </label>
            </div>
        </div>
    );
}