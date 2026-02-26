import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Añadido el Footer

interface Estilo {
    id: number;
    nombre: string;
}

export default function AddTatuaje() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombreTrabajador: '',
        estiloId: '',
        tituloTatuaje: '',
        tipo: 'Tatuaje',
        precioOriginal: '',
        precioOferta: '',
    });
    const [archivo, setArchivo] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('');
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [loadingEstilos, setLoadingEstilos] = useState(true);

    // Cargar estilos desde la BD
    useEffect(() => {
        setLoadingEstilos(true);

        api.get<Estilo[]>('/estilos')
            .then(res => {
                setEstilos(res.data);
            })
            .catch((err) => {
                console.error('Error cargando estilos:', err);
            })
            .finally(() => setLoadingEstilos(false));
    }, []);

    // Función para convertir a Base64
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
        setLoading(true);

        try {
            let imagenBase64 = "";
            if (archivo) {
                imagenBase64 = await convertirABase64(archivo);
            }

            if (!formData.estiloId) {
                alert('Por favor selecciona un estilo');
                setLoading(false);
                return;
            }

            const datosAEnviar = {
                nombre: formData.tituloTatuaje,
                tipo: formData.tipo,
                estilo: `/api/estilos/${formData.estiloId}`,
                imagen: imagenBase64,
                fecha_subida: new Date().toISOString().split('T')[0],
                precioOriginal: parseFloat(formData.precioOriginal.replace(',', '.')),
                precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta.replace(',', '.')) : null
            };

            await api.post('/proyectos', datosAEnviar, {
                headers: { 'Content-Type': 'application/ld+json' }
            });

            alert("¡Proyecto añadido con éxito!");
            navigate('/proyecto'); // Ojo: a lo mejor tu ruta es /proyectos (en plural)
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Detalles del error:", err.response?.data);
                alert(`Error ${err.response?.status}: No se pudo añadir el proyecto.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    return (
        <div className="bg-[#1C1B28] text-white relative min-h-screen flex flex-col">
            {/* FONDO (Mismo que en FormularioEstilo) */}
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
                                Añadir <span className="text-sky-500 font-bold">Proyecto</span>
                            </h1>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Título Tatuaje */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Título del Proyecto</label>
                                <input
                                    type="text"
                                    name="tituloTatuaje"
                                    value={formData.tituloTatuaje}
                                    placeholder="Ej: Dragón Japonés tradicional"
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {/* Estilo y Tipo (en dos columnas) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Estilo */}
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
                                        <option value="" disabled className="text-gray-500">
                                            {loadingEstilos ? 'Cargando estilos...' : 'Selecciona un estilo'}
                                        </option>
                                        {estilos.map(estilo => (
                                            <option key={`estilo-${estilo.id}`} value={estilo.id.toString()}>
                                                {estilo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tipo (Radio buttons estilizados) */}
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Tipo</label>
                                    <div className="flex gap-4 p-4 bg-[#1C1B28] border border-white/10 rounded-xl h-[58px] items-center">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="tipo" 
                                                value="Tatuaje" 
                                                checked={formData.tipo === 'Tatuaje'} 
                                                onChange={handleInputChange} 
                                                className="w-4 h-4 accent-sky-500 cursor-pointer" 
                                            />
                                            <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Tatuaje</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="tipo" 
                                                value="Plantilla" 
                                                checked={formData.tipo === 'Plantilla'} 
                                                onChange={handleInputChange} 
                                                className="w-4 h-4 accent-sky-500 cursor-pointer" 
                                            />
                                            <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Plantilla</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Imagen (Diseño de portada del estilo) */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Imagen del Proyecto</label>
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

                            {/* Precios y Descuento */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Precio Original (€)</label>
                                    <input
                                        type="text"
                                        name="precioOriginal"
                                        value={formData.precioOriginal}
                                        placeholder="Ej: 150"
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white"
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

                            {/* Botón Guardar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/30 active:scale-95 disabled:opacity-50 text-lg uppercase tracking-wider"
                            >
                                {loading ? 'Subiendo Proyecto...' : 'Crear Proyecto'}
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}