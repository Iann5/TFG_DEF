import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import FormLayout from '../components/FormLayout';
import FormPricing from '../components/FormPricing';
import FormSubmitButton from '../components/FormSubmitButton';
import { useAuth } from '../context/AuthContext';
import { getUserEmailFromToken } from '../utils/authUtils';

// --- INTERFACES ---

interface ItemSelect {
    id: number;
    nombre?: string;
    tituloTatuaje?: string;
    tipo?: string;
    imagen?: string;
}

interface PackAPI {
    id: number;
    titulo: string;
    descripcion: string;
    tipoPack: string;
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    imagen: string;
    imagenes: string[];
    productos: (string | { id: number })[];
    proyectos: (string | { id: number })[];
}

interface PackPayload {
    titulo: string;
    descripcion: string;
    tipoPack: string;
    imagenes: string[];
    imagen: string;
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    productos: string[];
    proyectos: string[];
    creador?: string;
}

interface ApiCollectionResponse<T> {
    'hydra:member'?: T[];
    member?: T[];
}

type ApiResult<T> = T[] | ApiCollectionResponse<T>;

type PackType = 'producto' | 'plantilla' | 'tatuaje';

export default function CrearPack() {
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

    const renderSelectionSection = (
        title: string,
        category: PackType,
        items: ItemSelect[],
        selectedItems: ItemSelect[],
        colors: { label: string; bgActive: string; borderActive: string },
        emptyMessage: string
    ) => {
        const isDisabled = activedPackType && activedPackType !== category;
        return (
            <div className={`p-6 border border-outline-variant/30 relative transition-opacity bg-surface-container/20 rounded-sm mt-4 ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className={`${colors.label} absolute -top-3 left-4 px-2 bg-background font-label text-[10px] tracking-[0.2em] uppercase`}>{title}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {items.map(p => {
                        const isSelected = selectedItems.some(s => s.id === p.id);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleItem(p, category)}
                                className={`px-4 py-2 font-body text-xs tracking-wide uppercase transition-colors border rounded-none flex items-center gap-2 ${isSelected ? `${colors.bgActive} ${colors.borderActive} font-bold` : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface'}`}
                            >
                                {p.tituloTatuaje || p.nombre}
                                {isSelected ? (
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px] opacity-30">add</span>
                                )}
                            </button>
                        );
                    })}
                    {items.length === 0 && <span className="text-xs font-label text-outline uppercase tracking-widest">{emptyMessage}</span>}
                </div>
            </div>
        );
    };

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Crear'}
            titleHighlight="Pack"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-primary font-headline uppercase tracking-wide">Cargando datos...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Título del pack
                            </label>
                            <input name="nombrePack" value={formData.nombrePack} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]" required />
                        </div>
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Tipo de pack
                            </label>
                            <input name="tipoDePack" value={formData.tipoDePack} readOnly placeholder="Se autocompleta..." className="w-full bg-surface-container/50 border border-outline-variant/30 p-3 font-body text-base outline-none text-outline-variant cursor-not-allowed uppercase transition-colors rounded-sm w-[99%]" required />
                        </div>
                    </div>

                    <div className="space-y-3 relative group border border-outline-variant/30 p-6 bg-surface-container/30 transition-colors mb-8 rounded-sm">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-2">
                             Galería de Imágenes
                        </label>
                        <div className="flex items-center gap-4 overflow-x-auto pt-2 pb-2 scrollbar-hide">
                            <button
                                type="button"
                                onClick={() => multiInputRef.current?.click()}
                                className="w-24 h-24 shrink-0 border border-outline-variant/50 border-dashed flex flex-col items-center justify-center hover:border-primary/50 hover:text-primary transition-colors text-outline-variant/50 group/add rounded-sm bg-surface-container"
                            >
                                <span className="material-symbols-outlined text-3xl font-light">add_photo_alternate</span>
                            </button>
                            {galeriaImagenes.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 shrink-0 border border-outline-variant/30 overflow-hidden group/img transition-transform hover:-translate-y-1 rounded-sm">
                                    <img src={img} className="w-full h-full object-cover transition-opacity opacity-80 group-hover/img:opacity-100" alt={`Pack ${idx}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImagen(idx)}
                                        className="absolute top-1 right-1 bg-error/90 w-6 h-6 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-sm"
                                    >
                                        <span className="material-symbols-outlined text-on-error text-[14px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" multiple ref={multiInputRef} className="hidden" accept="image/*" onChange={handleAddImagenes} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8 border-t border-outline-variant/30 pt-6">
                        {renderSelectionSection("Incluir Productos", "producto", productosDisponibles, productosSeleccionados, { label: "text-primary", bgActive: "bg-primary/20 text-primary border-primary", borderActive: "" }, "No hay productos disponibles")}
                        {renderSelectionSection("Incluir Plantillas", "plantilla", plantillasDisponibles, plantillasSeleccionadas, { label: "text-secondary-container", bgActive: "bg-secondary-container/20 text-secondary-container border-secondary-container", borderActive: "" }, "No hay plantillas disponibles")}
                        {renderSelectionSection("Incluir Tatuajes", "tatuaje", tatuajesDisponibles, tatuajesSeleccionados, { label: "text-tertiary", bgActive: "bg-tertiary/20 text-tertiary border-tertiary", borderActive: "" }, "No hay tatuajes disponibles")}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Descripción del pack
                            </label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors h-32 resize-none text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                    {stockLabel}
                                </label>
                                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                                {!esPackProducto && (
                                    <p className="text-outline-variant font-body text-xs">
                                        Este stock no se muestra a usuarios. Se descuenta 1 cada vez que reserven una cita de este pack.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                    Artículos totales
                                </label>
                                <input name="cantidad" type="number" min="1" value={formData.cantidad} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                            </div>
                        </div>
                        <FormPricing precioOriginal={formData.precioOriginal} precioOferta={formData.precioOferta} porcentajeDescuento={porcentajeDescuento} onPrecioOriginalChange={handleInputChange} onPorcentajeChange={handlePorcentajeChange} />
                    </div>

                    <FormSubmitButton loading={enviando} loadingText="Procesando..." text={isEdit ? 'Actualizar Pack' : 'Crear Pack'} />
                </>
            )}
        </FormLayout>
    );
}