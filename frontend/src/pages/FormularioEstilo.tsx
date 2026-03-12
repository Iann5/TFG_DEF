import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';
import FormLayout from '../components/FormLayout';
import FormSubmitButton from '../components/FormSubmitButton';

export default function FormularioEstilo() {
    const navigate = useNavigate();
    // Si existe el ID en la URL, estamos en modo edición
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const fotosInputRef = useRef<HTMLInputElement>(null);

    // Estados de los datos del Estilo
    const [nombre, setNombre] = useState('');
    const [informacion, setInformacion] = useState('');
    const [fotosEjemplo, setFotosEjemplo] = useState<string[]>([]);

    // Estados de control
    const [loading, setLoading] = useState(isEdit);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

    // 1. Cargar datos si es edición
    useEffect(() => {
        if (!isEdit || !id) return;

        api.get(`/estilos/${id}`)
            .then(res => {
                setNombre(res.data.nombre || '');
                setInformacion(res.data.informacion || '');
                setFotosEjemplo(res.data.imagenes || []);
            })
            .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar los datos del estilo.' }))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    // Helper para Base64
    const convertirBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    const handleAnadirFotoEjemplo = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || fotosEjemplo.length >= 3) return;
        const base64 = await convertirBase64(e.target.files[0]);
        setFotosEjemplo(prev => [...prev, base64]);
        e.target.value = ''; // Reset input
    };

    const eliminarFotoEjemplo = (index: number) => {
        setFotosEjemplo(prev => prev.filter((_, i) => i !== index));
    };

    // 2. Enviar Formulario (POST o PATCH)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const payload: Record<string, unknown> = {
                nombre,
                informacion,
                imagenes: fotosEjemplo,
                // Si la base de datos requiere obligatoriamente una 'imagen' principal, 
                // le mandamos la primera de la galería por defecto para que no explote.
                imagen: fotosEjemplo.length > 0 ? fotosEjemplo[0] : null
            };

            if (isEdit) {
                // PATCH para editar
                await api.patch(`/estilos/${id}`, payload, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Estilo actualizado con éxito!' });
            } else {
                // POST para crear
                await api.post('/estilos', payload, {
                    headers: { 'Content-Type': 'application/ld+json' }
                });
                setMensaje({ tipo: 'exito', texto: '¡Estilo creado correctamente!' });
            }

            setTimeout(() => navigate('/estilos'), 1500);
        } catch (err) {
            if (err instanceof AxiosError) {
                setMensaje({ tipo: 'error', texto: `Error: ${err.response?.status}. Verifica los datos e imágenes.` });
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Crear'}
            titleHighlight="Estilo"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-sky-400 font-bold">Cargando datos...</p>
            ) : (
                <>
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Nombre del Estilo</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    {/* Información */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Descripción / Información</label>
                        <textarea
                            value={informacion}
                            onChange={e => setInformacion(e.target.value)}
                            className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all h-32 resize-none"
                            required
                        />
                    </div>

                    {/* Fotos del Estilo */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Fotos del Estilo (Máx 3)</label>
                        <div className="grid grid-cols-3 gap-4">
                            {fotosEjemplo.map((foto, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                                    <img src={foto} className="w-full h-full object-cover" alt={`Foto ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => eliminarFotoEjemplo(index)}
                                        className="absolute top-1 right-1 bg-red-600 p-1 rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <span className="block w-4 h-4 text-[10px] font-bold text-center leading-4">✕</span>
                                    </button>
                                </div>
                            ))}
                            {fotosEjemplo.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fotosInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-gray-500 hover:text-sky-400"
                                >
                                    <span className="text-2xl font-light">+</span>
                                    <span className="text-[10px] uppercase font-bold">Subir</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fotosInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAnadirFotoEjemplo}
                        />
                    </div>

                    <FormSubmitButton
                        loading={enviando}
                        loadingText="Procesando..."
                        text={isEdit ? 'Actualizar Estilo' : 'Crear Estilo'}
                    />
                </>
            )}
        </FormLayout>
    );
}