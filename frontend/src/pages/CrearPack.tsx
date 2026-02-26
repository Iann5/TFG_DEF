import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { AxiosError } from 'axios';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getUserEmailFromToken } from '../utils/authUtils';

// ─── TIPADO ESTRICTO ─────────────────────────────────────────────────────────

interface ItemSelect {
    id: number;
    nombre?: string;
    tituloTatuaje?: string;
}

interface ApiCollectionResponse<T> {
    'hydra:member'?: T[];
    member?: T[];
}

type ApiResult<T> = T[] | ApiCollectionResponse<T>;

// ──────────────────────────────────────────────────────────────────────────────

export default function CrearPack() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const multiInputRef = useRef<HTMLInputElement>(null);

    // Estados de control de UI
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
    const [trabajadorId, setTrabajadorId] = useState<number | null>(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        nombrePack: '',
        descripcion: '',
        tipoDePack: '',
        precioOriginal: '',
        precioOferta: '',
        stock: '',
        cantidad: '',
    });
    
    // Selección múltiple de Items
    const [productosSeleccionados, setProductosSeleccionados] = useState<ItemSelect[]>([]);
    const [proyectosSeleccionados, setProyectosSeleccionados] = useState<ItemSelect[]>([]);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');

    // Estados de datos e imágenes (Galería)
    const [productosDisponibles, setProductosDisponibles] = useState<ItemSelect[]>([]);
    const [proyectosDisponibles, setProyectosDisponibles] = useState<ItemSelect[]>([]);
    const [galeriaImagenes, setGaleriaImagenes] = useState<string[]>([]); // Base64 de las fotos

    // 1. Obtener ID del trabajador y cargar datos
    useEffect(() => {
        const cargarInicial = async () => {
            try {
                // Obtener trabajador por email si está logueado
                if (isLoggedIn) {
                    const email = getUserEmailFromToken();
                    if (email) {
                        const resTrab = await api.get<ApiResult<{id: number}>>(`/trabajadors?usuario.email=${encodeURIComponent(email)}`);
                        const lista = Array.isArray(resTrab.data) ? resTrab.data : (resTrab.data['hydra:member'] ?? []);
                        if (lista.length > 0) setTrabajadorId(lista[0].id);
                    }
                }

                // Cargar productos y proyectos
                const [resProd, resProj] = await Promise.all([
                    api.get<ApiResult<ItemSelect>>('/productos'),
                    api.get<ApiResult<ItemSelect>>('/proyectos')
                ]);

                const extraer = (data: ApiResult<ItemSelect>) => Array.isArray(data) ? data : (data['hydra:member'] ?? []);
                setProductosDisponibles(extraer(resProd.data));
                setProyectosDisponibles(extraer(resProj.data));
            } catch (err) {
                console.error("Error en carga inicial", err);
            }
        };
        cargarInicial();
    }, [isLoggedIn]);

    // 2. Manejo de imágenes (Base64)
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

    const toggleItem = (item: ItemSelect, tipo: 'producto' | 'proyecto') => {
        if (tipo === 'producto') {
            setProductosSeleccionados(prev => 
                prev.find(p => p.id === item.id) ? prev.filter(p => p.id !== item.id) : [...prev, item]
            );
        } else {
            setProyectosSeleccionados(prev => 
                prev.find(p => p.id === item.id) ? prev.filter(p => p.id !== item.id) : [...prev, item]
            );
        }
    };

    const handlePorcentajeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setPorcentajeDescuento(valor);
        const precio = parseFloat(formData.precioOriginal.replace(',', '.'));
        const pNum = parseFloat(valor);
        if (!isNaN(precio) && !isNaN(pNum)) {
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

        if (!trabajadorId) {
            setMensaje({ tipo: 'error', texto: "Error de sesión: No eres un trabajador autorizado." });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                titulo: formData.nombrePack,
                descripcion: formData.descripcion,
                tipoPack: formData.tipoDePack,
                // Enviamos el array de imágenes al backend
                imagenes: galeriaImagenes, 
                imagen: galeriaImagenes[0], // Foto principal (la primera)
                precioOriginal: parseFloat(formData.precioOriginal.replace(',', '.')),
                precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
                stock: parseInt(formData.stock) || 0,
                cantidad: parseInt(formData.cantidad) || 1,
                productos: productosSeleccionados.map(p => `/api/productos/${p.id}`),
                proyectos: proyectosSeleccionados.map(p => `/api/proyectos/${p.id}`),
                creador: `/api/trabajadors/${trabajadorId}`
            };

            await api.post('/packs', payload, {
                headers: { 'Content-Type': 'application/ld+json' }
            });
            
            setMensaje({ tipo: 'exito', texto: '¡Pack creado con éxito!' });
            setTimeout(() => navigate('/merchandising'), 1500); 
            
        } catch (err) {
            setMensaje({ tipo: 'error', texto: "Error al guardar. Verifica los datos." });
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1C1B28] text-white relative min-h-screen flex flex-col">
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <Navbar />

                <main className="flex-grow flex flex-col items-center py-12 px-6">
                    <div className="w-full max-w-2xl bg-[#323444]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl">

                        <header className="mb-8 text-center">
                            <h1 className="text-3xl font-light uppercase tracking-widest">Crear <span className="text-sky-500 font-bold">Pack</span></h1>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mensaje && (
                                <div className={`p-4 rounded-xl text-center font-bold ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                    {mensaje.texto}
                                </div>
                            )}

                            {/* Título y Tipo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Título</label>
                                    <input name="nombrePack" value={formData.nombrePack} onChange={handleInputChange} className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Tipo de Pack</label>
                                    <input name="tipoDePack" value={formData.tipoDePack} onChange={handleInputChange} className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all" required />
                                </div>
                            </div>

                            {/* GALERÍA DE IMÁGENES CON SCROLL LATERAL */}
                            <div className="space-y-3">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Galería de Imágenes (Desliza para ver) </label>
                                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {/* Botón Añadir */}
                                    <button 
                                        type="button" 
                                        onClick={() => multiInputRef.current?.click()}
                                        className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-sky-500 transition-all text-gray-500"
                                    >
                                        <span className="text-2xl">+</span>
                                        <span className="text-[10px] uppercase font-bold">Añadir</span>
                                    </button>

                                    {/* Listado de Fotos */}
                                    {galeriaImagenes.map((img, idx) => (
                                        <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl border border-white/10 overflow-hidden group">
                                            <img src={img} className="w-full h-full object-cover" alt={`Pack ${idx}`} />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImagen(idx)}
                                                className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="block w-3 h-3 text-[10px] leading-3">✕</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input type="file" multiple ref={multiInputRef} className="hidden" accept="image/*" onChange={handleAddImagenes} />
                            </div>

                            {/* SELECCIÓN MÚLTIPLE ITEMS */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                    <label className="text-sky-400 text-[10px] font-black uppercase tracking-widest">Incluir Productos</label>
                                    <div className="flex flex-wrap gap-2">
                                        {productosDisponibles.map(p => (
                                            <button key={p.id} type="button" onClick={() => toggleItem(p, 'producto')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${productosSeleccionados.find(s => s.id === p.id) ? 'bg-sky-500 border-sky-400 text-white' : 'bg-[#1C1B28] border-white/10 text-gray-400'}`}>{p.nombre} {productosSeleccionados.find(s => s.id === p.id) ? '✓' : '+'}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                    <label className="text-purple-400 text-[10px] font-black uppercase tracking-widest">Incluir Tatuajes/Plantillas</label>
                                    <div className="flex flex-wrap gap-2">
                                        {proyectosDisponibles.map(p => (
                                            <button key={p.id} type="button" onClick={() => toggleItem(p, 'proyecto')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${proyectosSeleccionados.find(s => s.id === p.id) ? 'bg-purple-500 border-purple-400 text-white' : 'bg-[#1C1B28] border-white/10 text-gray-400'}`}>{p.tituloTatuaje || p.nombre} {proyectosSeleccionados.find(s => s.id === p.id) ? '✓' : '+'}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Descripción, Stock, Precios... (Sección final) */}
                            <div className="space-y-4">
                                <textarea name="descripcion" placeholder="Descripción del pack..." value={formData.descripcion} onChange={handleInputChange} className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 h-24 resize-none" required />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleInputChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500" required />
                                    <input name="cantidad" type="number" placeholder="Artículos totales" value={formData.cantidad} onChange={handleInputChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500" required />
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                    <input name="precioOriginal" placeholder="Precio €" value={formData.precioOriginal} onChange={handleInputChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500" required />
                                    <input type="number" placeholder="Descuento %" value={porcentajeDescuento} onChange={handlePorcentajeChange} className="bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-yellow-500 text-yellow-400" />
                                    <input type="text" value={formData.precioOferta || formData.precioOriginal || '0'} readOnly className="bg-[#1C1B28] border border-green-500/30 p-4 rounded-xl text-green-400 font-bold opacity-80 cursor-not-allowed" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                                {loading ? 'Creando Pack...' : 'Crear Pack'}
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}