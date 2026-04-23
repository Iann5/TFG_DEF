import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import { type Estilo, type ProyectoAPI, type ProyectoPayload } from '../types/proyecto';

export function useAddTatuaje() {
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

    return {
        isEdit,
        formData,
        archivo,
        setArchivo,
        imagenPrevia,
        loading,
        enviando,
        mensaje,
        porcentajeDescuento,
        estilos,
        loadingEstilos,
        handleSubmit,
        handleInputChange,
        handlePorcentajeChange
    };
}
