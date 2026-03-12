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
                    setGaleriaImagenes(imgs);

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
            const next = productosSeleccionados.find(p => p.id === item.id)
                ? productosSeleccionados.filter(p => p.id !== item.id)
                : [...productosSeleccionados, item];
            setProductosSeleccionados(next);
            setActivedPackType(next.length > 0 ? 'producto' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Producto' : '' }));
        } else if (category === 'plantilla') {
            const next = plantillasSeleccionadas.find(p => p.id === item.id)
                ? plantillasSeleccionadas.filter(p => p.id !== item.id)
                : [...plantillasSeleccionadas, item];
            setPlantillasSeleccionadas(next);
            setActivedPackType(next.length > 0 ? 'plantilla' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Plantilla' : '' }));
        } else if (category === 'tatuaje') {
            const next = tatuajesSeleccionados.find(p => p.id === item.id)
                ? tatuajesSeleccionados.filter(p => p.id !== item.id)
                : [...tatuajesSeleccionados, item];
            setTatuajesSeleccionados(next);
            setActivedPackType(next.length > 0 ? 'tatuaje' : null);
            setFormData(f => ({ ...f, tipoDePack: next.length > 0 ? 'Tatuaje' : '' }));
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

        if (galeriaImagenes.length === 0) {
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
                imagenes: galeriaImagenes.slice(1),
                imagen: galeriaImagenes[0],
                precioOriginal: parseFloat(formData.precioOriginal.replace(',', '.')),
                precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
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
            <div className={`p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 transition-opacity ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className={`${colors.label} text-[10px] font-black uppercase tracking-widest`}>{title}</label>
                <div className="flex flex-wrap gap-2">
                    {items.map(p => {
                        const isSelected = selectedItems.some(s => s.id === p.id);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleItem(p, category)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? `${colors.bgActive} ${colors.borderActive} text-white` : 'bg-[#1C1B28] border-white/10 text-gray-400'}`}
                            >
                                {p.tituloTatuaje || p.nombre} {isSelected ? '✓' : '+'}
                            </button>
                        );
                    })}
                    {items.length === 0 && <span className="text-xs text-gray-500">{emptyMessage}</span>}
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
                <p className="text-center animate-pulse text-sky-400 font-bold">Cargando datos...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Título</label>
                            <input name="nombrePack" value={formData.nombrePack} onChange={handleInputChange} className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Tipo de Pack</label>
                            <input name="tipoDePack" value={formData.tipoDePack} readOnly placeholder="Se autocompleta..." className="w-full bg-[#1C1B28] border border-white/5 p-4 rounded-xl outline-none text-gray-500 cursor-not-allowed" required />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Galería de Imágenes</label>
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            <button
                                type="button"
                                onClick={() => multiInputRef.current?.click()}
                                className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-sky-500 transition-all text-gray-500"
                            >
                                <span className="text-2xl">+</span>
                                <span className="text-[10px] uppercase font-bold">Añadir</span>
                            </button>
                            {galeriaImagenes.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl border border-white/10 overflow-hidden group">
                                    <img src={img} className="w-full h-full object-cover" alt={`Pack ${idx}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImagen(idx)}
                                        className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="block w-3 h-3 text-[10px] leading-3 text-white">✕</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" multiple ref={multiInputRef} className="hidden" accept="image/*" onChange={handleAddImagenes} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {renderSelectionSection("Incluir Productos", "producto", productosDisponibles, productosSeleccionados, { label: "text-sky-400", bgActive: "bg-sky-500", borderActive: "border-sky-400" }, "No hay productos")}
                        {renderSelectionSection("Incluir Plantillas", "plantilla", plantillasDisponibles, plantillasSeleccionadas, { label: "text-purple-400", bgActive: "bg-purple-500", borderActive: "border-purple-400" }, "No hay plantillas")}
                        {renderSelectionSection("Incluir Tatuajes", "tatuaje", tatuajesDisponibles, tatuajesSeleccionados, { label: "text-fuchsia-400", bgActive: "bg-fuchsia-500", borderActive: "border-fuchsia-400" }, "No hay tatuajes")}
                    </div>

                    <div className="space-y-4">
                        <textarea name="descripcion" placeholder="Descripción del pack..." value={formData.descripcion} onChange={handleInputChange} className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 h-24 resize-none text-white" required />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleInputChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 text-white" required />
                            <input name="cantidad" type="number" placeholder="Artículos totales" value={formData.cantidad} onChange={handleInputChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 text-white" required />
                        </div>
                        <FormPricing precioOriginal={formData.precioOriginal} precioOferta={formData.precioOferta} porcentajeDescuento={porcentajeDescuento} onPrecioOriginalChange={handleInputChange} onPorcentajeChange={handlePorcentajeChange} />
                    </div>

                    <FormSubmitButton loading={enviando} loadingText="Procesando..." text={isEdit ? 'Actualizar Pack' : 'Crear Pack'} />
                </>
            )}
        </FormLayout>
    );
}