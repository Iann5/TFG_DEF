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
    descripcion?: string | null;
    imagen?: string;
}

interface ProyectoPayload {
    nombre: string;
    tipo: string;
    estilo: string; // Formato IRI: /api/estilos/id
    precio_original: number;
    precio_oferta: number | null;
    descripcion?: string | null;
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
        descripcionOferta: '',
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
                    precioOferta: p.precio_oferta?.toString() || '',
                    descripcionOferta: p.descripcion || ''
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
                precio_original: parseFloat(formData.precioOriginal.replace(',', '.')),
                precio_oferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
                descripcion: formData.descripcionOferta?.trim() || null
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
                const backendError = err.response?.data?.detail || err.response?.data?.message || err.message;
                setMensaje({ tipo: 'error', texto: `Error: ${backendError}` });
                console.error("Detalle del error del backend:", err.response?.data);
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
                <p className="text-center animate-pulse text-primary font-headline uppercase tracking-wide">Cargando datos...</p>
            ) : (
                <>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            Título del Proyecto
                        </label>
                        <input
                            type="text"
                            name="tituloTatuaje"
                            value={formData.tituloTatuaje}
                            placeholder="Ej: Dragón Japonés"
                            onChange={handleInputChange}
                            required
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Estilo
                            </label>
                            <div className="relative w-[99%]">
                                <select
                                    name="estiloId"
                                    value={formData.estiloId}
                                    onChange={handleInputChange}
                                    disabled={loadingEstilos || estilos.length === 0}
                                    required
                                    className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface appearance-none cursor-pointer disabled:opacity-50 rounded-sm"
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
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible z-10 w-[99%]">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Tipo
                            </label>
                            <div className="flex gap-6 p-3 bg-surface-container/50 border border-outline-variant/30 items-center justify-start rounded-sm z-0 relative">
                                {(['Tatuaje', 'Plantilla'] as const).map((t) => (
                                    <label key={t} className="flex items-center gap-3 cursor-pointer group/radio">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value={t}
                                            checked={formData.tipo === t}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-primary cursor-pointer border-outline-variant"
                                        />
                                        <span className={`text-sm font-label tracking-wide uppercase transition-colors ${formData.tipo === t ? 'text-primary' : 'text-on-surface-variant group-hover/radio:text-on-surface'}`}>{t}</span>
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

                    {/* Descripción (si hay oferta, describe condiciones; si no, orienta tamaño/precio) */}
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            {formData.precioOferta ? 'Descripción de la oferta' : 'Descripción (orientación tamaño/precio)'}
                        </label>
                        <input
                            type="text"
                            name="descripcionOferta"
                            value={formData.descripcionOferta}
                            onChange={handleInputChange}
                            placeholder={
                                formData.precioOferta
                                    ? 'Esa oferta se aplica a partir de 10cm de tamaño, si lo quieres más grande se te aplicará la misma oferta pero el precio sube'
                                    : 'Ej: El precio corresponde aprox. a 10cm. Para tamaños mayores el precio sube según el diseño.'
                            }
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]"
                        />
                    </div>

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