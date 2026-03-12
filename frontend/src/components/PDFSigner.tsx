import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import { Download, RotateCcw, Eye } from 'lucide-react';
import { type PDFSignerProps } from '../types/FirmaPDF';

export default function PDFSigner({ formData, trabajador, onSignComplete }: PDFSignerProps) {
    const sigResponsabilidadRef = useRef<SignatureCanvas>(null);
    const sigPrivacidadRef = useRef<SignatureCanvas>(null);
    const [responsabilidadFirmado, setResponsabilidadFirmado] = useState<boolean>(false);
    const [privacidadFirmado, setPrivacidadFirmado] = useState<boolean>(false);
    const [pdfsDescargados, setPdfsDescargados] = useState({ resp: false, priv: false });

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
        setPrevResponsabilidad(docResp.output('datauristring'));

        if (necesitaPrivacidad) {
            const docPriv = crearDocPrivacidad();
            setPrevPrivacidad(docPriv.output('datauristring'));
        }
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
    const manejarDescargaGenerica = (doc: jsPDF, nombre: string, tipo: 'resp' | 'priv', firmado: boolean) => {
        doc.save(`${nombre}_${formData.nombre}_${formData.fecha}.pdf`);
        if (firmado) {
            setPdfsDescargados(prev => ({ ...prev, [tipo]: true }));
        }
    };

    const descargarResponsabilidadFirmado = () => {
        const canvas = sigResponsabilidadRef.current;
        if (!canvas || canvas.isEmpty()) return;

        try {
            // Se usa getCanvas() en lugar de getTrimmedCanvas() que a veces falla en algunos navegadores/dispositivos
            const sig = canvas.getCanvas().toDataURL('image/png');
            const doc = crearDocResponsabilidad(sig);
            manejarDescargaGenerica(doc, 'Responsabilidad', 'resp', true);
        } catch (error) {
            console.error("Error al generar el PDF firmado de Responsabilidad:", error);
            alert("No se pudo generar el PDF con la firma.");
        }
    };

    const descargarPrivacidadFirmado = () => {
        const canvas = sigPrivacidadRef.current;
        if (!canvas || canvas.isEmpty()) return;

        try {
            const sig = canvas.getCanvas().toDataURL('image/png');
            const doc = crearDocPrivacidad(sig);
            manejarDescargaGenerica(doc, 'Privacidad', 'priv', true);
        } catch (error) {
            console.error("Error al generar el PDF firmado de Privacidad:", error);
            alert("No se pudo generar el PDF con la firma.");
        }
    };

    // Callback para que ReservoirCita sepa si ha acabado
    useEffect(() => {
        const respOk = responsabilidadFirmado && pdfsDescargados.resp;
        const privOk = necesitaPrivacidad ? (privacidadFirmado && pdfsDescargados.priv) : true;

        if (respOk && privOk) {
            const canvasResp = sigResponsabilidadRef.current;
            const canvasPriv = sigPrivacidadRef.current;

            onSignComplete({
                responsabilidad: canvasResp?.getCanvas().toDataURL('image/png') || '',
                ...(necesitaPrivacidad && canvasPriv && {
                    privacidad: canvasPriv.getCanvas().toDataURL('image/png')
                })
            });
        } else {
            onSignComplete({ responsabilidad: '' });
        }
    }, [responsabilidadFirmado, privacidadFirmado, pdfsDescargados, necesitaPrivacidad]);

    return (
        <div className="space-y-8 animate-fade-in w-full text-left">
            {/* Caja de Responsabilidad */}
            <div className="bg-[#1C1B28] p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <h3 className="font-bold text-lg text-white">1. Acuerdo de Responsabilidad</h3>
                <p className="text-white/60 text-sm">
                    Revisa las condiciones del documento de responsabilidad antes de firmarlo. Puedes descargarlo en blanco si lo deseas.
                </p>

                {/* Previsualización del PDF */}
                {prevResponsabilidad && (
                    <div className="w-full h-64 border border-white/20 rounded-xl overflow-hidden bg-white/5 relative">
                        <iframe
                            src={`${prevResponsabilidad}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="Previsualización Responsabilidad"
                        />
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <button
                                onClick={() => crearDocResponsabilidad().save(`Responsabilidad_Borrador_${formData.nombre}.pdf`)}
                                className="bg-gray-800/80 hover:bg-gray-700 backdrop-blur text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition"
                            >
                                <Eye size={14} /> Descargar PDF Sin Firmar
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl overflow-hidden mt-4 border-2 border-dashed border-sky-400">
                    <p className="text-gray-500 text-xs px-4 pt-2 text-center uppercase tracking-wide">Área de Firma - Usa tu ratón o dedo</p>
                    <SignatureCanvas
                        ref={sigResponsabilidadRef}
                        canvasProps={{ width: 500, height: 150, className: 'w-full h-[150px] cursor-crosshair touch-none' }}
                        onEnd={handleEndResponsabilidad}
                    />
                </div>

                <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                    <button onClick={clearResponsabilidad} className="text-white/50 hover:text-red-400 text-sm flex items-center gap-1">
                        <RotateCcw size={16} /> Borrar firma
                    </button>

                    <button
                        type="button"
                        onClick={descargarResponsabilidadFirmado}
                        disabled={!responsabilidadFirmado}
                        className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition ${responsabilidadFirmado ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Download size={18} />
                        {pdfsDescargados.resp ? '¡PDF Firmado Descargado!' : 'Descargar PDF Final Firmado'}
                    </button>
                </div>
            </div>

            {/* Caja de Privacidad */}
            {necesitaPrivacidad && (
                <div className="bg-[#1C1B28] p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                    <h3 className="font-bold text-lg text-white">2. Privacidad de Datos y Diseño</h3>
                    <p className="text-white/60 text-sm">
                        Debes aceptar el tratamiento de tus datos e ideas para la creación de la obra personalizada.
                    </p>

                    {/* Previsualización del PDF */}
                    {prevPrivacidad && (
                        <div className="w-full h-64 border border-white/20 rounded-xl overflow-hidden bg-white/5 relative">
                            <iframe
                                src={`${prevPrivacidad}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full"
                                title="Previsualización Privacidad"
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button
                                    onClick={() => crearDocPrivacidad().save(`Privacidad_Borrador_${formData.nombre}.pdf`)}
                                    className="bg-gray-800/80 hover:bg-gray-700 backdrop-blur text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition"
                                >
                                    <Eye size={14} /> Descargar PDF Sin Firmar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl overflow-hidden mt-4 border-2 border-dashed border-purple-400">
                        <p className="text-gray-500 text-xs px-4 pt-2 text-center uppercase tracking-wide">Área de Firma - Usa tu ratón o dedo</p>
                        <SignatureCanvas
                            ref={sigPrivacidadRef}
                            canvasProps={{ width: 500, height: 150, className: 'w-full h-[150px] cursor-crosshair touch-none' }}
                            onEnd={handleEndPrivacidad}
                        />
                    </div>

                    <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                        <button onClick={clearPrivacidad} className="text-white/50 hover:text-red-400 text-sm flex items-center gap-1">
                            <RotateCcw size={16} /> Borrar firma
                        </button>

                        <button
                            type="button"
                            onClick={descargarPrivacidadFirmado}
                            disabled={!privacidadFirmado}
                            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition ${privacidadFirmado ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Download size={18} />
                            {pdfsDescargados.priv ? '¡PDF Firmado Descargado!' : 'Descargar PDF Final Firmado'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-sky-900/20 border border-sky-500/30 p-4 rounded-xl text-center shadow-lg">
                <p className="text-sky-200 text-sm">
                    <strong>Aviso Importante:</strong> El botón final de confirmación de reserva solo se activará una vez hayas firmado y descargado los documentos finales. Deberás presentar el/los PDF(s) en el estudio.
                </p>
            </div>
        </div>
    );
}