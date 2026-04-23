import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getUserEmailFromToken } from '../utils/authUtils';
import {
    type ItemSelect,
    type PackAPI,
    type PackPayload,
    type ApiResult,
    type PackType,
} from '../types/Pack';

export function useCrearPack() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const { isLoggedIn } = useAuth();
    const multiInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState<boolean>(isEdit);
    const [enviando, setEnviando] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
    const [trabajadorId, setTrabajadorId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        nombrePack: '',
        descripcion: '',
        tipoDePack: '',
        precioOriginal: '',
        precioOferta: '',
        stock: '',
        cantidad: '',
    });

    const [activedPackType, setActivedPackType] = useState<PackType | null>(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState<ItemSelect[]>([]);
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState<ItemSelect[]>([]);
    const [tatuajesSeleccionados, setTatuajesSeleccionados] = useState<ItemSelect[]>([]);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');
    const [productosDisponibles, setProductosDisponibles] = useState<ItemSelect[]>([]);
    const [proyectosDisponibles, setProyectosDisponibles] = useState<ItemSelect[]>([]);
    const [galeriaImagenes, setGaleriaImagenes] = useState<string[]>([]);
    
    const esPackProducto = activedPackType === 'producto';
    const stockLabel = esPackProducto ? 'Stock' : 'Citas disponibles (stock)';

    // Helper para extraer IDs de IRIs o Objetos sin usar any
    const extractId = (item: string | { id: number }): number => {
        if (typeof item === 'object') return item.id;
        return parseInt(item.split('/').pop() || '0');
    };

    useEffect(() => {
        const cargarInicial = async () => {
            try {
                if (isLoggedIn) {
                    const email = getUserEmailFromToken();
                    if (email) {
                        const resTrab = await api.get<ApiResult<{ id: number }>>(`/trabajadors?usuario.email=${encodeURIComponent(email)}`);
                        const lista = Array.isArray(resTrab.data) ? resTrab.data : (resTrab.data['hydra:member'] ?? []);
                        if (lista.length > 0) setTrabajadorId(lista[0].id);
                    }
                }

                const [resProd, resProj] = await Promise.all([
                    api.get<ApiResult<ItemSelect>>('/productos'),
                    api.get<ApiResult<ItemSelect>>('/proyectos')
                ]);

                const extraer = (data: ApiResult<ItemSelect>) => Array.isArray(data) ? data : (data['hydra:member'] ?? []);
                const prods = extraer(resProd.data);
                const projs = extraer(resProj.data);

                setProductosDisponibles(prods);
                setProyectosDisponibles(projs);

                if (isEdit && id) {
                    const resPack = await api.get<PackAPI>(`/packs/${id}`);
                    const p = resPack.data;

                    setFormData({
                        nombrePack: p.titulo || '',
                        descripcion: p.descripcion || '',
                        tipoDePack: p.tipoPack || '',
                        precioOriginal: p.precioOriginal?.toString() || '',
                        precioOferta: p.precioOferta?.toString() || '',
                        stock: p.stock?.toString() || '0',
                        cantidad: p.cantidad?.toString() || '1',
                    });

                    if (p.precioOriginal && p.precioOferta) {
                        const desc = ((1 - (p.precioOferta / p.precioOriginal)) * 100).toFixed(0);
                        setPorcentajeDescuento(desc);
                    }

                    if (p.tipoPack) {
                        const typeNormalized = p.tipoPack.toLowerCase();
                        if (typeNormalized === 'producto' || typeNormalized === 'plantilla' || typeNormalized === 'tatuaje') {
                            setActivedPackType(typeNormalized);
                        }
                    }

                    const imgs = [];
                    if (p.imagen) imgs.push(p.imagen);
                    if (p.imagenes?.length > 0) imgs.push(...p.imagenes);
                    // Evita duplicados al editar
                    setGaleriaImagenes(Array.from(new Set(imgs.filter(Boolean))));

                    if (p.productos?.length > 0) {
                        const prodIds = p.productos.map(extractId);
                        setProductosSeleccionados(prods.filter(prod => prodIds.includes(prod.id)));
                    }

                    if (p.proyectos?.length > 0) {
                        const projIds = p.proyectos.map(extractId);
                        const projsSel = projs.filter(proj => projIds.includes(proj.id));
                        setPlantillasSeleccionadas(projsSel.filter(pr => pr.tipo?.toLowerCase() === 'plantilla' || pr.tituloTatuaje?.toLowerCase().includes('plantilla')));
                        setTatuajesSeleccionados(projsSel.filter(pr => pr.tipo?.toLowerCase() === 'tatuaje' || pr.tituloTatuaje?.toLowerCase().includes('tatuaje')));
                    }
                }
            } catch (err) {
                console.error("Error en carga inicial", err);
            } finally {
                setLoading(false);
            }
        };
        cargarInicial();
    }, [isLoggedIn, isEdit, id]);

    const handleAddImagenes = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const nuevasImagenes: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(files[i]);
                reader.onload = () => resolve(reader.result as string);
            });
            nuevasImagenes.push(base64);
        }
        setGaleriaImagenes(prev => [...prev, ...nuevasImagenes]);
    };

    const removeImagen = (index: number) => {
        setGaleriaImagenes(prev => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleItem = (item: ItemSelect, category: PackType) => {
        if (activedPackType && activedPackType !== category) return;

        if (category === 'producto') {
            const wasSelected = productosSeleccionados.some(p => p.id === item.id);
            const next = productosSeleccionados.find(p => p.id === item.id)
                ? productosSeleccionados.filter(p => p.id !== item.id)
                : [...productosSeleccionados, item];
            setProductosSeleccionados(next);
            setActivedPackType(next.length > 0 ? 'producto' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Producto' : '' }));

            // Auto: en packs de productos, usa la imagen del producto seleccionado como
            // imagen principal del pack (sin duplicarla).
            if (!wasSelected) {
                const img = item.imagen?.trim();
                if (img) {
                    setGaleriaImagenes(prev => {
                        const filtered = prev.filter(existing => existing !== img);
                        return [img, ...filtered];
                    });
                }
            }
        } else if (category === 'plantilla') {
            const next = plantillasSeleccionadas.find(p => p.id === item.id)
                ? plantillasSeleccionadas.filter(p => p.id !== item.id)
                : [...plantillasSeleccionadas, item];
            setPlantillasSeleccionadas(next);
            setActivedPackType(next.length > 0 ? 'plantilla' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Plantilla' : '' }));

            // Auto: añade la imagen del proyecto seleccionado a la galería
            if (!plantillasSeleccionadas.find(p => p.id === item.id)) {
                const img = item.imagen?.trim();
                if (img) {
                    setGaleriaImagenes(prev => (prev.includes(img) ? prev : [...prev, img]));
                }
            }
        } else if (category === 'tatuaje') {
            const next = tatuajesSeleccionados.find(p => p.id === item.id)
                ? tatuajesSeleccionados.filter(p => p.id !== item.id)
                : [...tatuajesSeleccionados, item];
            setTatuajesSeleccionados(next);
            setActivedPackType(next.length > 0 ? 'tatuaje' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Tatuaje' : '' }));

            // Auto: añade la imagen del proyecto seleccionado a la galería
            if (!tatuajesSeleccionados.find(p => p.id === item.id)) {
                const img = item.imagen?.trim();
                if (img) {
                    setGaleriaImagenes(prev => (prev.includes(img) ? prev : [...prev, img]));
                }
            }
        }
    };

    const handlePorcentajeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setPorcentajeDescuento(valor);

        if (!valor || parseFloat(valor) === 0) {
            setFormData(prev => ({ ...prev, precioOferta: '' }));
            return;
        }

        const precio = parseFloat(formData.precioOriginal.replace(',', '.'));
        const pNum = parseFloat(valor);
        if (!isNaN(precio) && !isNaN(pNum) && pNum > 0 && pNum <= 100) {
            setFormData(prev => ({ ...prev, precioOferta: (precio * (1 - pNum / 100)).toFixed(2) }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMensaje(null);

        const uniqueGaleria = Array.from(
            new Set(
                galeriaImagenes
                    .map(img => img?.trim?.() ?? img)
                    .filter((img): img is string => Boolean(img))
            )
        );

        if (uniqueGaleria.length === 0) {
            setMensaje({ tipo: 'error', texto: "Debes subir al menos una imagen." });
            return;
        }

        if (!isEdit && !trabajadorId) {
            setMensaje({ tipo: 'error', texto: "Error de sesión: No eres un trabajador autorizado." });
            return;
        }

        setEnviando(true);

        try {
            const payload: PackPayload = {
                titulo: formData.nombrePack,
                descripcion: formData.descripcion,
                tipoPack: formData.tipoDePack,
                imagenes: uniqueGaleria.slice(1),
                imagen: uniqueGaleria[0],
                precioOriginal: parseFloat(formData.precioOriginal.replace(',', '.')),
                precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
                // También usamos stock en packs de plantilla/tatuaje para limitar reservas
                stock: parseInt(formData.stock) || 0,
                cantidad: parseInt(formData.cantidad) || 1,
                productos: productosSeleccionados.map(p => `/api/productos/${p.id}`),
                proyectos: [...plantillasSeleccionadas, ...tatuajesSeleccionados].map(p => `/api/proyectos/${p.id}`),
            };

            if (isEdit) {
                await api.patch(`/packs/${id}`, payload, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Pack actualizado con éxito!' });
            } else {
                payload.creador = `/api/trabajadors/${trabajadorId}`;
                await api.post('/packs', payload, {
                    headers: { 'Content-Type': 'application/ld+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Pack creado con éxito!' });
            }

            setTimeout(() => navigate('/ofertasYpacks'), 1500);

        } catch (err) {
            setMensaje({ tipo: 'error', texto: "Error al guardar. Verifica los datos." });
            console.error(err);
        } finally {
            setEnviando(false);
        }
    };

    const plantillasDisponibles = proyectosDisponibles.filter(p => !p.tipo || p.tipo?.toLowerCase() === 'plantilla' || p.tituloTatuaje?.toLowerCase().includes('plantilla'));
    const tatuajesDisponibles = proyectosDisponibles.filter(p => p.tipo?.toLowerCase() === 'tatuaje' || p.tituloTatuaje?.toLowerCase().includes('tatuaje'));

    return {
        isEdit,
        loading,
        enviando,
        mensaje,
        formData,
        handleInputChange,
        activedPackType,
        productosSeleccionados,
        plantillasSeleccionadas,
        tatuajesSeleccionados,
        porcentajeDescuento,
        handlePorcentajeChange,
        productosDisponibles,
        plantillasDisponibles,
        tatuajesDisponibles,
        galeriaImagenes,
        handleAddImagenes,
        removeImagen,
        esPackProducto,
        stockLabel,
        handleSubmit,
        toggleItem,
        multiInputRef
    };
}
