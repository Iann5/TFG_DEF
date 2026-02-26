import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getUserEmailFromToken } from '../utils/authUtils';

export default function AddProducto() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // Estados de control de UI
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
    const [trabajadorId, setTrabajadorId] = useState<number | null>(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precioOriginal: '',
        precioOferta: '',
        stock: ''
    });
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');

    // Estados de imagen
    const [archivo, setArchivo] = useState<File | null>(null);

    // Obtener el ID del trabajador logueado
    useEffect(() => {
        if (!isLoggedIn) return;
        const email = getUserEmailFromToken();
        if (!email) return;

        api.get(`/trabajadors?usuario.email=${encodeURIComponent(email)}`)
            .then((res) => {
                const data = res.data;
                const list = Array.isArray(data) ? data : (data['hydra:member'] ?? data.member ?? []);
                if (list.length > 0) {
                    const t = list[0] as { id: number };
                    setTrabajadorId(t.id);
                }
            })
            .catch(console.error);
    }, [isLoggedIn]);

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

    // Lógica robusta de cálculo de descuentos (Misma que AddTatuaje)
    const calcularPrecioOferta = (precioOriginal: string, porcentaje: string): string => {
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
        if (!trabajadorId) {
            setMensaje({ tipo: 'error', texto: "Solo los trabajadores pueden publicar productos." });
            return;
        }
        if (!archivo) {
            setMensaje({ tipo: 'error', texto: "Debes subir una imagen para el producto." });
            return;
        }

        setLoading(true);

        try {
            const imagenBase64 = await convertirABase64(archivo);

            // Payload alineado exactamente con Producto.php
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                imagen: imagenBase64,
                precio_original: parseFloat(formData.precioOriginal.replace(',', '.')),
                precio_oferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null,
                stock: parseInt(formData.stock) || 0,
                fecha_subida: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                creador: `/api/trabajadors/${trabajadorId}`
            };

            await api.post('/productos', payload, {
                headers: { 'Content-Type': 'application/ld+json' }
            });

            setMensaje({ tipo: 'exito', texto: '¡Producto publicado correctamente en la tienda!' });

            // Redirige al catálogo tras un breve retraso
            setTimeout(() => navigate('/merchandising'), 1500);

        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Detalles del error 500:", err.response?.data);
                setMensaje({ tipo: 'error', texto: `Error ${err.response?.status}: Revisa que todos los campos estén completos.` });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1C1B28] text-white relative min-h-screen flex flex-col font-sans">
            {/* FONDO */}
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}
            ></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <Navbar />

                <main className="flex-grow flex flex-col items-center py-12 px-6">
                    <div className="w-full max-w-2xl bg-[#323444]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl">

                        <header className="mb-8 text-center">
                            <h1 className="text-3xl font-light uppercase tracking-widest">
                                Añadir <span className="text-sky-500 font-bold">Producto</span>
                            </h1>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Alerta Visual Elegante */}
                            {mensaje && (
                                <div className={`p-4 rounded-xl text-center font-bold transition-all ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                    {mensaje.texto}
                                </div>
                            )}

                            {/* Nombre del Producto */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Nombre del Producto</label>
                                <input
                                    name="nombre"
                                    type="text"
                                    placeholder="Ej: Camiseta Diseño Exclusivo"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    placeholder="Detalles sobre el material, tallas, etc."
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all h-28 resize-none text-white placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Stock Disponible</label>
                                <input
                                    name="stock"
                                    type="number"
                                    placeholder="Unidades"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* Imagen con Preview Visual (Estilo unificado) */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Imagen del Producto</label>
                                <div className="flex items-center gap-4 p-4 bg-[#1C1B28] border border-white/10 rounded-xl overflow-hidden">
                                    {archivo ? (
                                        <img 
                                            src={URL.createObjectURL(archivo)} 
                                            className="w-16 h-16 object-cover rounded-lg border border-sky-500/50 shrink-0" 
                                            alt="Preview"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 border-dashed flex items-center justify-center shrink-0">
                                            <span className="text-xs text-gray-500">IMG</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        required
                                        onChange={(e) => e.target.files && setArchivo(e.target.files[0])}
                                        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer w-full"
                                    />
                                </div>
                            </div>

                            {/* Precios y Descuento en 3 columnas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Precio Original (€)</label>
                                    <input
                                        type="text"
                                        name="precioOriginal"
                                        value={formData.precioOriginal}
                                        placeholder="Ej: 25.50"
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Descuento (%)</label>
                                    <input
                                        type="number"
                                        value={porcentajeDescuento}
                                        onChange={handlePorcentajeChange}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-yellow-500 transition-all text-yellow-400 placeholder-gray-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-green-500/80 text-sm font-bold uppercase tracking-wider block">Precio Final (€)</label>
                                    <input
                                        type="text"
                                        value={formData.precioOferta ? formData.precioOferta : formData.precioOriginal || '0'}
                                        readOnly
                                        className="w-full bg-[#1C1B28] border border-green-500/30 p-4 rounded-xl outline-none text-green-400 font-bold opacity-80 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/30 active:scale-95 disabled:opacity-50 text-lg uppercase tracking-wider"
                            >
                                {loading ? 'Publicando Producto...' : 'Publicar Producto'}
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}