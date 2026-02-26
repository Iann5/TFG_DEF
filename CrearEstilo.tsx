import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

export default function CrearEstiloPage() {
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [informacion, setInformacion] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

    const convertirABase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArchivo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje(null);

        try {
            let imagenTexto: string | null = null;
            if (archivo) imagenTexto = await convertirABase64(archivo);

            await api.post('/estilos', {
                nombre,
                informacion,
                imagen: imagenTexto
            }, {
                headers: { 'Content-Type': 'application/ld+json' }
            });

            setMensaje({ tipo: 'exito', texto: '¡Estilo creado correctamente!' });
            setTimeout(() => navigate('/estilos'), 1500);
        } catch (error) {
            if (error instanceof AxiosError) {
                const status = error.response?.status;
                if (status === 500) {
                    setMensaje({ tipo: 'error', texto: 'Error 500: Posiblemente la imagen es demasiado grande para el campo en la Base de Datos.' });
                } else if (status === 400) {
                    setMensaje({ tipo: 'error', texto: 'Error 400: Datos incorrectos. Revisa el formulario.' });
                } else {
                    setMensaje({ tipo: 'error', texto: `Error del servidor: ${status}` });
                }
            } else {
                console.error('Error desconocido:', error);
                setMensaje({ tipo: 'error', texto: 'Ha ocurrido un error inesperado.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] relative font-sans">
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover' }}
            ></div>

            <Navbar />

            <main className="relative z-10 flex flex-col items-center py-10 px-4">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-500/30 backdrop-blur-lg border rounded-2xl p-8 shadow-2xl space-y-6">
                    <div className="w-full max-w-2xl bg-gray-200 backdrop-blur-md rounded-xl py-4 mb-6 text-center shadow-xl">
                        <h1 className="text-black text-3xl font-light tracking-wide text-center">Añadir Estilo</h1>
                    </div>

                    {mensaje && (
                        <div className={`p-4 mb-2 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-white text-xl block">Nombre</label>
                        <input 
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] p-3 rounded-lg text-white placeholder-gray-300 outline-none shadow-inner"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-white text-xl block">Información</label>
                        <textarea 
                            value={informacion}
                            onChange={(e) => setInformacion(e.target.value)}
                            className="w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] p-3 rounded-lg text-white placeholder-gray-300 outline-none h-32"
                            placeholder="Describe el estilo..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-white text-xl block">Imagen</label>
                        <div className="relative w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] rounded-lg">
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-3 opacity-0 absolute inset-0 cursor-pointer z-20"
                            />
                            <div className="p-3 text-gray-200">
                                {archivo ? archivo.name : 'Elegir Archivo'}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-sky-600 hover:bg-blue-600 text-white text-2xl font-light rounded-xl transition-all active:scale-95"
                    >
                        {loading ? 'Subiendo...' : 'Guardar Estilo'}
                    </button>
                </form>
            </main>
        </div>
    );
}