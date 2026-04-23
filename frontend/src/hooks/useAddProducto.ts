import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getUserEmailFromToken } from '../utils/authUtils';
import { type ProductoForm, type HydraResponse, type ProductoPayload } from '../types/producto';

interface TrabajadorId {
    id: number;
}

export function useAddProducto() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState<boolean>(isEdit);
    const [enviando, setEnviando] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
    const [trabajadorId, setTrabajadorId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precioOriginal: '',
        precioOferta: '',
        stock: ''
    });
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [imagenPrevia, setImagenPrevia] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        const email = getUserEmailFromToken();
        if (!email) return;

        api.get<HydraResponse<TrabajadorId> | TrabajadorId[]>(`/trabajadors?usuario.email=${encodeURIComponent(email)}`)
            .then((res) => {
                const data = res.data;
                const list = Array.isArray(data)
                    ? data
                    : (data['hydra:member'] ?? data.member ?? []);

                if (list.length > 0) {
                    setTrabajadorId(list[0].id);
                }
            })
            .catch(console.error);
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isEdit || !id) return;

        api.get<ProductoForm>(`/productos/${id}`)
            .then(res => {
                const p = res.data;
                setFormData({
                    nombre: p.nombre || '',
                    descripcion: p.descripcion || '',
                    precioOriginal: p.precio_original?.toString() || '',
                    precioOferta: p.precio_oferta?.toString() || '',
                    stock: p.stock?.toString() || '0'
                });

                if (p.precio_original && p.precio_oferta) {
                    const desc = ((1 - (p.precio_oferta / p.precio_original)) * 100).toFixed(0);
                    setPorcentajeDescuento(desc);
                }
                if (p.imagen) {
                    setImagenPrevia(p.imagen);
                }
            })
            .catch(err => {
                console.error("Error al cargar producto", err);
                setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información del producto.' });
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calcularPrecioOferta = (precioOriginal: string, porcentaje: string): string => {
        if (!porcentaje || parseFloat(porcentaje) === 0) return '';
        const precio = parseFloat(precioOriginal.replace(',', '.'));
        const porcentajeNum = parseFloat(porcentaje);

        if (isNaN(precio) || isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
            return '';
        }

        const precioOferta = precio * (1 - porcentajeNum / 100);
        return precioOferta.toFixed(2);
    };

    const handlePorcentajeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setPorcentajeDescuento(valor);
        const precioCalculado = calcularPrecioOferta(formData.precioOriginal, valor);
        setFormData(prev => ({ ...prev, precioOferta: precioCalculado }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMensaje(null);

        if (!isLoggedIn) {
            setMensaje({ tipo: 'error', texto: "Debes iniciar sesión para publicar un producto." });
            return;
        }
        if (!isEdit && !trabajadorId) {
            setMensaje({ tipo: 'error', texto: "Solo los trabajadores pueden publicar productos." });
            return;
        }
        if (!isEdit && !archivo) {
            setMensaje({ tipo: 'error', texto: "Debes subir una imagen para el producto." });
            return;
        }

        setEnviando(true);

        try {
            let imagenBase64: string | null = null;
            if (archivo) {
                imagenBase64 = await convertirABase64(archivo);
            }

            const payload: ProductoPayload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio_original: parseFloat(formData.precioOriginal.replace(',', '.')),
                precio_oferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
                stock: parseInt(formData.stock) || 0,
            };

            if (imagenBase64) {
                payload.imagen = imagenBase64;
            }

            if (isEdit) {
                await api.patch(`/productos/${id}`, payload, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Producto actualizado correctamente!' });
            } else {
                payload.fecha_subida = new Date().toISOString().split('T')[0];
                payload.creador = `/api/trabajadors/${trabajadorId}`;
                await api.post('/productos', payload, {
                    headers: { 'Content-Type': 'application/ld+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Producto publicado correctamente!' });
            }

            setTimeout(() => navigate('/merchandising'), 1500);

        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Detalles del error:", err.response?.data);
                setMensaje({ tipo: 'error', texto: `Error ${err.response?.status}: Revisa los campos.` });
            }
        } finally {
            setEnviando(false);
        }
    };

    return {
        isEdit,
        loading,
        enviando,
        mensaje,
        formData,
        porcentajeDescuento,
        archivo,
        imagenPrevia,
        setArchivo,
        handleInputChange,
        handlePorcentajeChange,
        handleSubmit
    };
}
