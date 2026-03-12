import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import FormLayout from '../components/FormLayout';
import FormImageUpload from '../components/FormImageUpload';
import FormPricing from '../components/FormPricing';
import FormSubmitButton from '../components/FormSubmitButton';

// --- INTERFACES ---

interface Estilo {
    id: number;
    nombre: string;
}

interface ProyectoAPI {
    id: number;
    nombre?: string;
    tipo?: 'Tatuaje' | 'Plantilla';
    estilo?: string | { id: number }; // Puede venir como IRI o como objeto
    precio_original?: number;
    precio_oferta?: number | null;
    imagen?: string;
}

interface ProyectoPayload {
    nombre: string;
    tipo: string;
    estilo: string; // Formato IRI: /api/estilos/id
    precioOriginal: number;
    precioOferta: number | null;
    imagen?: string;
    fecha_subida?: string;
}

export default function AddTatuaje() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombreTrabajador: '',
        estiloId: '',
        tituloTatuaje: '',
        tipo: 'Tatuaje',
        precioOriginal: '',
        precioOferta: '',
    });

    const [archivo, setArchivo] = useState<File | null>(null);
    const [imagenPrevia, setImagenPrevia] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(isEdit);
    const [enviando, setEnviando] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [loadingEstilos, setLoadingEstilos] = useState(true);

    useEffect(() => {
        setLoadingEstilos(true);
        api.get<Estilo[]>('/estilos')
            .then(res => setEstilos(res.data))
            .catch(console.error)
            .finally(() => setLoadingEstilos(false));
    }, []);

    useEffect(() => {
        if (!isEdit || !id) return;
        api.get<ProyectoAPI>(`/proyectos/${id}`)
            .then(res => {
                const p = res.data;

                // Extracción segura del ID del estilo (IRI o Objeto)
                let estiloObjId = '';
                if (p.estilo) {
                    if (typeof p.estilo === 'object') {
                        estiloObjId = p.estilo.id.toString();
                    } else {
                        estiloObjId = p.estilo.split('/').pop() || '';
                    }
                }

                setFormData({
                    nombreTrabajador: '',
                    estiloId: estiloObjId,
                    tituloTatuaje: p.nombre || '',
                    tipo: p.tipo || 'Tatuaje',
                    precioOriginal: p.precio_original?.toString() || '',
                    precioOferta: p.precio_oferta?.toString() || ''
                });

                if (p.precio_original && p.precio_oferta) {
                    const desc = ((1 - (p.precio_oferta / p.precio_original)) * 100).toFixed(0);
                    setPorcentajeDescuento(desc);
                }

                if (p.imagen) setImagenPrevia(p.imagen);
            })
            .catch(err => {
                console.error("Error al cargar proyecto", err);
                setMensaje({ tipo: 'error', texto: "No se pudo cargar la información." });
            })
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const convertirABase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setEnviando(true);

        try {
            let imagenBase64: string | null = null;
            if (archivo) {
                imagenBase64 = await convertirABase64(archivo);
            }

            if (!formData.estiloId) {
                setMensaje({ tipo: 'error', texto: 'Por favor selecciona un estilo' });
                setEnviando(false);
                return;
            }

            // --- PAYLOAD TIPADO ---
            const datosAEnviar: ProyectoPayload = {
                nombre: formData.tituloTatuaje,
                tipo: formData.tipo,
                estilo: `/api/estilos/${formData.estiloId}`,
                precioOriginal: parseFloat(formData.precioOriginal.replace(',', '.')),
                precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null
            };

            if (imagenBase64) {
                datosAEnviar.imagen = imagenBase64;
            }

            if (isEdit) {
                await api.patch(`/proyectos/${id}`, datosAEnviar, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                setMensaje({ tipo: 'exito', texto: "¡Proyecto actualizado!" });
            } else {
                if (!imagenBase64) {
                    setMensaje({ tipo: 'error', texto: "Debes añadir una imagen" });
                    setEnviando(false);
                    return;
                }
                datosAEnviar.fecha_subida = new Date().toISOString().split('T')[0];
                await api.post('/proyectos', datosAEnviar, {
                    headers: { 'Content-Type': 'application/ld+json' }
                });
                setMensaje({ tipo: 'exito', texto: "¡Proyecto añadido!" });
            }

            setTimeout(() => navigate('/proyecto'), 1500);
        } catch (err) {
            if (err instanceof AxiosError) {
                setMensaje({ tipo: 'error', texto: `Error ${err.response?.status}: No se pudo procesar.` });
            }
        } finally {
            setEnviando(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePorcentajeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setPorcentajeDescuento(valor);

        if (!valor || parseFloat(valor) === 0) {
            setFormData(prev => ({ ...prev, precioOferta: '' }));
            return;
        }

        const precio = parseFloat(formData.precioOriginal.replace(',', '.'));
        const porcentajeNum = parseFloat(valor);

        if (!isNaN(precio) && !isNaN(porcentajeNum) && porcentajeNum > 0 && porcentajeNum <= 100) {
            const precioCalculado = (precio * (1 - porcentajeNum / 100)).toFixed(2);
            setFormData(prev => ({ ...prev, precioOferta: precioCalculado }));
        }
    };

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Añadir'}
            titleHighlight="Proyecto"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-sky-400 font-bold">Cargando datos...</p>
            ) : (
                <>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Título del Proyecto</label>
                        <input
                            type="text"
                            name="tituloTatuaje"
                            value={formData.tituloTatuaje}
                            placeholder="Ej: Dragón Japonés"
                            onChange={handleInputChange}
                            required
                            className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Estilo</label>
                            <select
                                name="estiloId"
                                value={formData.estiloId}
                                onChange={handleInputChange}
                                disabled={loadingEstilos || estilos.length === 0}
                                required
                                className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="" disabled>
                                    {loadingEstilos ? 'Cargando estilos...' : 'Selecciona un estilo'}
                                </option>
                                {estilos.map(estilo => (
                                    <option key={estilo.id} value={estilo.id.toString()}>
                                        {estilo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Tipo</label>
                            <div className="flex gap-4 p-4 bg-[#1C1B28] border border-white/10 rounded-xl h-[58px] items-center">
                                {(['Tatuaje', 'Plantilla'] as const).map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value={t}
                                            checked={formData.tipo === t}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-sky-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <FormImageUpload
                        archivo={archivo}
                        imagenPrevia={imagenPrevia}
                        onChange={(e) => e.target.files && setArchivo(e.target.files[0])}
                        isRequired={!isEdit}
                        label="Imagen del Proyecto"
                    />

                    <FormPricing
                        precioOriginal={formData.precioOriginal}
                        precioOferta={formData.precioOferta}
                        porcentajeDescuento={porcentajeDescuento}
                        onPrecioOriginalChange={handleInputChange}
                        onPorcentajeChange={handlePorcentajeChange}
                    />

                    <FormSubmitButton
                        loading={enviando}
                        loadingText="Procesando..."
                        text={isEdit ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                    />
                </>
            )}
        </FormLayout>
    );
}